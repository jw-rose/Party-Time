import { getEvent } from '@/server/dal/events.dal'
import { isHost, canUpload, canChat } from '@/server/services/permission.service'
import { notFound, redirect } from 'next/navigation'
import { CalendarDays, MapPin, ImageIcon, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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

  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const formattedTime = new Date(event.date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={userIsHost ? 'default' : 'secondary'}>
              {userIsHost ? 'Hosting' : 'Attending'}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {event.title}
          </h1>
        </div>
        {userIsHost && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/events/${event.id}/edit`}>Edit event</Link>
          </Button>
        )}
      </div>

      {/* Event details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Event details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
          {event.description && (
            <p className="text-sm text-muted-foreground pt-2">
              {event.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Host actions */}
      {userIsHost && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-lg text-amber-800 dark:text-amber-400">
              Host actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild size="sm">
              <Link href={`/events/${event.id}/invite`}>
                Invite guests
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/events/${event.id}/guests`}>
                View guests
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className={!userCanUpload ? 'opacity-50' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Photos</p>
              <p className="text-xs text-muted-foreground">
                {userCanUpload ? 'Upload and view photos' : 'Not enabled'}
              </p>
            </div>
            {userCanUpload && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/events/${event.id}/photos`}>Open</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className={!userCanChat ? 'opacity-50' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Group chat</p>
              <p className="text-xs text-muted-foreground">
                {userCanChat ? 'Chat with guests' : 'Not enabled'}
              </p>
            </div>
            {userCanChat && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/events/${event.id}/chat`}>Open</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}