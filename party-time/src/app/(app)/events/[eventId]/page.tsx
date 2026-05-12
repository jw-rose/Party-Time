import { getEvent } from '@/server/dal/events.dal'
import { isHost, canUpload, canChat } from '@/server/services/permission.service'
import { getEventPosts } from '@/server/dal/posts.dal'
import { getGuests } from '@/server/dal/guests.dal'
import { notFound, redirect } from 'next/navigation'
import { db } from '@/server/db'
import { guests } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { CalendarDays, MapPin, UserPlus, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { CreatePostForm } from '@/components/features/events/create-post-form'
import { EventPostCard } from '@/components/features/events/event-post'
import { RSVPButton } from '@/components/features/events/rsvp-button'
import { GuestList } from '@/components/features/events/guest-list'

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  let data

  try {
    data = await getEvent(eventId)
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') redirect('/login')
      if (error.message === 'FORBIDDEN') redirect('/dashboard')
      if (error.message === 'NOT_FOUND') notFound()
    }
    notFound()
  }

  const { event, userId } = data
  const userIsHost = isHost(userId, event)
  const userCanUpload = canUpload(userId, event)
  const userCanChat = canChat(userId, event)
  const posts = await getEventPosts(event.id)
  const allGuests = await getGuests(event.id)

  const guestRecord = !userIsHost
    ? await db.query.guests.findFirst({
        where: and(
          eq(guests.eventId, event.id),
          eq(guests.userId, userId)
        ),
      })
    : null

  const currentGuestStatus = guestRecord?.status ?? 'pending'

  const going = allGuests.filter((g) => g.status === 'going').length
  const maybe = allGuests.filter((g) => g.status === 'maybe').length
  const pending = allGuests.filter((g) => g.status === 'pending').length

  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-0 -mx-4">

      {/* Hero header */}
      <div className="px-4 pt-4 pb-5 space-y-3">

        {/* Host label */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {userIsHost ? 'Y' : 'H'}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {userIsHost ? 'You are hosting' : `Hosted by someone`}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight leading-tight">
          {event.title}
        </h1>

        {/* Date + location */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Guest avatars + action button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {allGuests.slice(0, 5).map((guest, i) => (
                <div
                  key={guest.id}
                  className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: [
                      '#C4B5FD',
                      '#F9A8D4',
                      '#6EE7B7',
                      '#FCD34D',
                      '#93C5FD',
                    ][i % 5],
                    color: '#1e293b',
                    zIndex: 5 - i,
                  }}
                >
                  {guest.user.name[0].toUpperCase()}
                </div>
              ))}
              {allGuests.length > 5 && (
                <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{allGuests.length - 5}
                </div>
              )}
            </div>
            {going > 0 && (
              <span className="text-sm text-muted-foreground">
                {going} going
              </span>
            )}
          </div>

          {/* Action button */}
          {userIsHost ? (
            <Button asChild size="sm" className="rounded-full px-4">
              <Link href={`/events/${event.id}/invite`}>
                <UserPlus className="h-4 w-4 mr-1.5" />
                Invite
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-full px-4"
            >
              <Link href={`/events/${event.id}/guests`}>
                Change RSVP
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full rounded-none border-b bg-background h-12 px-4 justify-start gap-0">
          <TabsTrigger
            value="info"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full"
          >
            Info
          </TabsTrigger>
          <TabsTrigger
            value="guests"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full"
          >
            Guests
          </TabsTrigger>
          {userCanUpload && (
            <TabsTrigger
              value="photos"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full"
            >
              Photos
            </TabsTrigger>
          )}
          {userCanChat && (
            <TabsTrigger
              value="chat"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-full"
            >
              Chat
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── INFO TAB ── */}
        <TabsContent value="info" className="px-4 pt-4 space-y-4">

          {/* Host actions panel */}
          {userIsHost && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                  Host actions
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" className="rounded-lg">
                    <Link href={`/events/${event.id}/edit`}>
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit event
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-lg">
                    <Link href={`/events/${event.id}/invite`}>
                      Share link
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-lg">
                    <Link href={`/events/${event.id}/invite`}>
                      QR code
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guest breakdown — host only */}
          {userIsHost && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Guest breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
                    <p className="text-2xl font-bold text-green-600">
                      {going}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Going
                    </p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl">
                    <p className="text-2xl font-bold text-yellow-600">
                      {maybe}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Maybe
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-xl">
                    <p className="text-2xl font-bold text-muted-foreground">
                      {pending}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pending
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* About this event */}
          {(event.description || event.location) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  About this event
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-2">
                {event.description && (
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* RSVP — guest only */}
          {!userIsHost && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <RSVPButton
                  eventId={event.id}
                  currentStatus={currentGuestStatus}
                />
              </CardContent>
            </Card>
          )}

          {/* Updates / Posts */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              Updates
              {posts.length > 0 && (
                <span className="text-muted-foreground font-normal ml-1.5">
                  {posts.length}
                </span>
              )}
            </h3>

            {userIsHost && <CreatePostForm eventId={event.id} />}

            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground text-sm">
                  No updates yet
                  {userIsHost && ' — post a message above'}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <EventPostCard
                    key={post.id}
                    post={post}
                    isHost={userIsHost}
                    eventId={event.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Chat preview */}
          {userCanChat && (
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <p className="text-sm font-medium">Chat</p>
                <Button asChild size="sm" variant="ghost" className="text-primary">
                  <Link href={`/events/${event.id}/chat`}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Photos preview */}
          {userCanUpload && (
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <p className="text-sm font-medium">Photos</p>
                <Button asChild size="sm" variant="ghost" className="text-primary">
                  <Link href={`/events/${event.id}/photos`}>See all</Link>
                </Button>
              </CardContent>
            </Card>
          )}

        </TabsContent>

        {/* ── GUESTS TAB ── */}
        <TabsContent value="guests" className="px-4 pt-4">
          <GuestList
            guests={allGuests}
            eventId={event.id}
            isHost={userIsHost}
            currentUserId={userId}
          />
          {userIsHost && (
            <div className="mt-4">
              <Button asChild className="w-full rounded-xl" variant="outline">
                <Link href={`/events/${event.id}/invite`}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite more guests
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── PHOTOS TAB ── */}
        {userCanUpload && (
          <TabsContent value="photos" className="px-4 pt-4">
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Photos coming soon</p>
              <Button asChild className="mt-4 rounded-xl" variant="outline">
                <Link href={`/events/${event.id}/photos`}>
                  Open photos
                </Link>
              </Button>
            </div>
          </TabsContent>
        )}

        {/* ── CHAT TAB ── */}
        {userCanChat && (
          <TabsContent value="chat" className="px-4 pt-4">
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Chat coming soon</p>
              <Button asChild className="mt-4 rounded-xl" variant="outline">
                <Link href={`/events/${event.id}/chat`}>
                  Open chat
                </Link>
              </Button>
            </div>
          </TabsContent>
        )}

      </Tabs>
    </div>
  )
}