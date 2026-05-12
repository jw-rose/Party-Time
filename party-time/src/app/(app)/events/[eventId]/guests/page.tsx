import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/server/db'
import { events } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { getGuests } from '@/server/dal/guests.dal'
import { GuestList } from '@/components/features/events/guest-list'
import { RSVPButton } from '@/components/features/events/rsvp-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'

export default async function GuestsPage({
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

  const allGuests = await getGuests(eventId)

  const userIsHost = event.hostId === session.user.id

  const currentUserGuest = allGuests.find(
    (g) => g.userId === session.user.id
  )

  // Stats
  const going = allGuests.filter((g) => g.status === 'going').length
  const maybe = allGuests.filter((g) => g.status === 'maybe').length
  const pending = allGuests.filter((g) => g.status === 'pending').length

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to event
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Guest list</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {event.title}
          </p>
        </div>
        {userIsHost && (
          <Button asChild size="sm">
            <Link href={`/events/${eventId}/invite`}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Link>
          </Button>
        )}
      </div>

      {/* Stats — host only */}
      {userIsHost && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {going}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Going
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {maybe}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Maybe
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="text-2xl font-bold text-gray-400">
                {pending}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Pending
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* RSVP buttons — guest only */}
      {!userIsHost && currentUserGuest && (
        <Card>
          <CardContent className="pt-4">
            <RSVPButton
              eventId={eventId}
              currentStatus={currentUserGuest.status}
            />
          </CardContent>
        </Card>
      )}

      {/* Guest list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Guests
            <Badge variant="secondary" className="ml-2">
              {allGuests.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GuestList
            guests={allGuests}
            eventId={eventId}
            isHost={userIsHost}
            currentUserId={session.user.id}
          />
        </CardContent>
      </Card>

    </div>
  )
}