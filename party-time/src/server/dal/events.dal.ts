import 'server-only'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { events, guests } from '@/server/db/schema'
import { eq, or } from 'drizzle-orm'
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
  })

  if (!event) {
    throw new Error('NOT_FOUND')
  }

  // Check user is host or guest
  const isHost = event.hostId === session.user.id

  if (!isHost) {
    const guestRecord = await db.query.guests.findFirst({
      where:
        eq(guests.eventId, eventId) &&
        eq(guests.userId, session.user.id),
    })

    if (!guestRecord) {
      throw new Error('FORBIDDEN')
    }
  }

  return { event, userId: session.user.id }
}

// Get all events for the current user
export async function getUserEvents() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('UNAUTHORIZED')
  }

  const hostedEvents = await db.query.events.findMany({
    where: eq(events.hostId, session.user.id),
  })

  return { hostedEvents, userId: session.user.id }
}