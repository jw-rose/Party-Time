'use server'

import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { events } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { createEventSchema, updateEventSchema } from '@/lib/validations'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createEvent(formData: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  const result = createEventSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const id = crypto.randomUUID()

  await db.insert(events).values({
    id,
    hostId: session.user.id,
    title: result.data.title,
    description: result.data.description ?? null,
    date: new Date(result.data.date),
    location: result.data.location ?? null,
    photosEnabled: result.data.photosEnabled,
    chatEnabled: result.data.chatEnabled,
  })

  return { success: true, eventId: id }
}

export async function updateEvent(eventId: string, formData: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  // Check user is host
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event) return { error: 'Event not found' }
  if (event.hostId !== session.user.id) return { error: 'Unauthorized' }

  const result = updateEventSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  await db
    .update(events)
    .set({
      title: result.data.title,
      description: result.data.description ?? null,
      date: new Date(result.data.date),
      location: result.data.location ?? null,
      photosEnabled: result.data.photosEnabled,
      chatEnabled: result.data.chatEnabled,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId))

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}

export async function deleteEvent(eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  // Check user is host
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event) return { error: 'Event not found' }
  if (event.hostId !== session.user.id) return { error: 'Unauthorized' }

  await db.delete(events).where(eq(events.id, eventId))

  return { success: true }
}