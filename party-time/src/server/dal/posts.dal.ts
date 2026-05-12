import 'server-only'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { eventPosts } from '@/server/db/schema'
import { eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function getEventPosts(eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) throw new Error('UNAUTHORIZED')

  return db.query.eventPosts.findMany({
    where: eq(eventPosts.eventId, eventId),
    with: {
      author: true,
    },
    orderBy: [desc(eventPosts.createdAt)],
  })
}