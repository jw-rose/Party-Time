'use server'

import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { photos, events } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

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