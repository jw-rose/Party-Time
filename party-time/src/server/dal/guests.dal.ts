import 'server-only'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { guests } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function getGuests(eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) throw new Error('UNAUTHORIZED')

  return db.query.guests.findMany({
    where: eq(guests.eventId, eventId),
    with: {
      user: true,
    },
  })
}

export async function isHost(eventId: string, hostId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return false
  return session.user.id === hostId
}