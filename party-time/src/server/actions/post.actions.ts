'use server'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { eventPosts, events, guests } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { createPostSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function createPost(
  eventId: string,
  formData: unknown,
  allowGuests = false
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { error: 'Unauthorized' }

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })
  if (!event) return { error: 'Event not found' }

  const isHost = event.hostId === session.user.id

  if (!isHost) {
    if (!allowGuests) return { error: 'Unauthorized' }

    // Check user is a guest of this event
    const guestRecord = await db.query.guests.findFirst({
      where: and(
        eq(guests.eventId, eventId),
        eq(guests.userId, session.user.id)
      ),
    })
    if (!guestRecord) return { error: 'Unauthorized' }
  }

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

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })
  if (!event) return { error: 'Event not found' }

  const post = await db.query.eventPosts.findFirst({
    where: eq(eventPosts.id, postId),
  })
  if (!post) return { error: 'Post not found' }

  // Host can delete any post, guests can only delete their own
  const isHost = event.hostId === session.user.id
  const isAuthor = post.authorId === session.user.id

  if (!isHost && !isAuthor) return { error: 'Unauthorized' }

  await db.delete(eventPosts).where(eq(eventPosts.id, postId))
  revalidatePath(`/events/${eventId}`)
  return { success: true }
}