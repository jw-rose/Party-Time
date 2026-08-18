'use server'

import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { photos, guests, events } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function savePhoto(eventId: string, url: string, key: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  // Verify user is host or guest of this event
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event) return { error: 'Event not found' }

  const isHost = event.hostId === session.user.id

  if (!isHost) {
    const guest = await db.query.guests.findFirst({
      where: and(
        eq(guests.eventId, eventId),
        eq(guests.userId, session.user.id)
      ),
    })

    if (!guest) return { error: 'Forbidden' }
    if (!event.photosEnabled) return { error: 'Photos are disabled for this event' }
  }

  await db.insert(photos).values({
    id: crypto.randomUUID(),
    eventId,
    uploadedBy: session.user.id,
    url,
    key,
  })

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}

export async function deletePhoto(photoId: string, eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  const photo = await db.query.photos.findFirst({
    where: and(eq(photos.id, photoId), eq(photos.eventId, eventId)),
  })

  if (!photo) return { error: 'Photo not found' }

  // Only uploader or host can delete
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event) return { error: 'Event not found' }

  const isHost = event.hostId === session.user.id
  const isUploader = photo.uploadedBy === session.user.id

  if (!isHost && !isUploader) return { error: 'Forbidden' }

  await db.delete(photos).where(eq(photos.id, photoId))

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}