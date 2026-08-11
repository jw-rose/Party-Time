import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserEvents } from '@/server/dal/events.dal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/features/events/event-card'
import { CalendarPlus } from 'lucide-react'

export default async function EventsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  const { hostedEvents, attendingEvents } = await getUserEvents(session.user.id)

  // Deduplicate — a user who hosts an event won't see it twice
  const hostedIds = new Set(hostedEvents.map((e) => e.id))

  const myEvents = [
    ...hostedEvents.map((e) => ({ ...e, isHost: true as const })),
    ...attendingEvents
      .filter((e) => !hostedIds.has(e.id))
      .map((e) => ({ ...e, isHost: false as const })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My events</h1>
          <p className="text-muted-foreground mt-1">
            Your events — hosting and attending
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <CalendarPlus className="h-4 w-4 mr-2" />
            New event
          </Link>
        </Button>
      </div>

      {myEvents.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-4">No events yet</p>
          <Button asChild>
            <Link href="/events/new">Create your first event</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {myEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isHost={event.isHost}
            />
          ))}
        </div>
      )}
    </div>
  )
}
