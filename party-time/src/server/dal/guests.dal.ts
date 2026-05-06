import 'server-only'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { guests } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'

// Check if current user is host of an event
export async function isHost(eventId: string, hostId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return false

  return session.user.id === hostId
}

// Get all guests for an event
export async function getGuests(eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error('UNAUTHORIZED')
  }

  return db.query.guests.findMany({
    where: eq(guests.eventId, eventId),
    with: {
      user: true,
    },
  })
}