import 'server-only'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { events, guests } from '@/server/db/schema'
import { and, eq, gte, inArray, lte, or } from 'drizzle-orm'
import { headers } from 'next/headers'

// Get a single event — checks session first
export async function getEvent(eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('UNAUTHORIZED')
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: { host: true },
  })

  if (!event) {
    throw new Error('NOT_FOUND')
  }

  // Check user is host or guest
  const isHost = event.hostId === session.user.id

  if (!isHost) {
    const guestRecord = await db.query.guests.findFirst({
      where: and(
        eq(guests.eventId, eventId),
        eq(guests.userId, session.user.id),
      ),
    })

    if (!guestRecord) {
      throw new Error('FORBIDDEN')
    }
  }

  return { event, userId: session.user.id }
}

// RSVP statuses that count as "attending" for list/dashboard purposes.
// 'declined' and 'pending' are excluded — declined is an explicit no,
// and pending means the user hasn't responded yet.
export const ATTENDING_STATUSES = ['going', 'maybe'] as const
// Get events in a date range for the current user (hosted + attending)
export async function getUserEventsInRange(startDate: Date, endDate: Date) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) throw new Error('UNAUTHORIZED')

  const hostedRows = await db
    .select({ id: events.id, title: events.title, date: events.date })
    .from(events)
    .where(
      and(
        eq(events.hostId, session.user.id),
        gte(events.date, startDate),
        lte(events.date, endDate)
      )
    )

  const attendingRows = await db
    .select({ id: events.id, title: events.title, date: events.date })
    .from(guests)
    .innerJoin(events, eq(guests.eventId, events.id))
    .where(
      and(
        eq(guests.userId, session.user.id),
        gte(events.date, startDate),
        lte(events.date, endDate)
      )
    )

  const hostedIds = new Set(hostedRows.map((e) => e.id))
  return [
    ...hostedRows,
    ...attendingRows.filter((e) => !hostedIds.has(e.id)),
  ]
}

// Get all events for a user — both hosted and attending (going/maybe only)
export async function getUserEvents(userId: string) {
  const [hostedEvents, guestRecords] = await Promise.all([
    db.query.events.findMany({
      where: eq(events.hostId, userId),
    }),
    db.query.guests.findMany({
      where: and(
        eq(guests.userId, userId),
        inArray(guests.status, [...ATTENDING_STATUSES]),
      ),
      with: { event: true },
    }),
  ])

  const attendingEvents = guestRecords.map((g) => g.event)

  return { hostedEvents, attendingEvents, userId }
}
