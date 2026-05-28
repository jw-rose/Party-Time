import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/server/db'
import { events, guests, eventPosts } from '@/server/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { isHost, canChat } from '@/server/services/permission.service'
import { CreatePostForm } from '@/components/features/events/create-post-form'
import { EventPostCard } from '@/components/features/events/event-post'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event) notFound()

  const userId = session.user.id
  const userIsHost = isHost(userId, event)

  const guestRecord = !userIsHost
    ? await db.query.guests.findFirst({
        where: and(
          eq(guests.eventId, eventId),
          eq(guests.userId, userId)
        ),
      })
    : null

  const userCanChat = canChat(userId, event, guestRecord)

  if (!userCanChat) redirect(`/events/${eventId}`)

  const posts = await db.query.eventPosts.findMany({
    where: eq(eventPosts.eventId, eventId),
    with: { author: true },
    orderBy: [asc(eventPosts.createdAt)],
  })

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button asChild size="icon" variant="ghost" className="rounded-xl">
          <Link href={`/events/${eventId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-base font-semibold">{event.title}</h1>
          <p className="text-xs text-muted-foreground">Group chat</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Be the first to say something</p>
          </div>
        ) : (
          posts.map((post) => (
            <EventPostCard
              key={post.id}
              post={post}
              isHost={userIsHost}
              eventId={eventId}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="pt-4 border-t">
        <CreatePostForm
          eventId={eventId}
          allowGuests={true}
          placeholder="Say something to the group..."
        />
      </div>

    </div>
  )
}