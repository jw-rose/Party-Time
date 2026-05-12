'use server'

import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { eventPosts, events } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { createPostSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function createPost(eventId: string, formData: unknown) {
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

  // Validate content
  const result = createPostSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  await db.insert(eventPosts).values({
    id: crypto.randomUUID(),
    eventId,
    authorId: session.user.id,
    content: result.data.content,
  })

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}

export async function deletePost(postId: string, eventId: string) {
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

  await db.delete(eventPosts).where(eq(eventPosts.id, postId))

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}