'use server'

import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { guests, events } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Update RSVP status
export async function updateRSVP(eventId: string, status: 'going' | 'maybe' | 'declined') {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  const existing = await db.query.guests.findFirst({
    where: and(
      eq(guests.eventId, eventId),
      eq(guests.userId, session.user.id)
    ),
  })

  if (!existing) return { error: 'You are not a guest of this event' }

  await db
    .update(guests)
    .set({
      status,
      respondedAt: new Date(),
    })
    .where(
      and(
        eq(guests.eventId, eventId),
        eq(guests.userId, session.user.id)
      )
    )

  revalidatePath(`/events/${eventId}/guests`)
  return { success: true }
}

// Remove a guest — host only
export async function removeGuest(eventId: string, guestUserId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  // Check current user is host
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event) return { error: 'Event not found' }
  if (event.hostId !== session.user.id) return { error: 'Unauthorized' }

  await db
    .delete(guests)
    .where(
      and(
        eq(guests.eventId, eventId),
        eq(guests.userId, guestUserId)
      )
    )

  revalidatePath(`/events/${eventId}/guests`)
  return { success: true }
}