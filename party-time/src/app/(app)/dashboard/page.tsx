import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/server/db'
import { events, guests } from '@/server/db/schema'
import { eq, gte } from 'drizzle-orm'
import Link from 'next/link'
import { CalendarDays, MapPin, CalendarPlus, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  const firstName = session.user.name?.split(' ')[0] ?? 'there'

  const now = new Date()

  // Events I am hosting
  const hostedEvents = await db.query.events.findMany({
    where: eq(events.hostId, session.user.id),
    orderBy: (events, { asc }) => [asc(events.date)],
  })

  // Events I am attending as a guest
  const guestRecords = await db.query.guests.findMany({
    where: eq(guests.userId, session.user.id),
    with: { event: true },
  })

  const attendingEvents = guestRecords.map((g) => g.event)

  // Split into upcoming and past
  // Deduplicate — host should not appear twice for their own event
const hostedIds = new Set(hostedEvents.map((e) => e.id))

const allEvents = [
  ...hostedEvents.map((e) => ({ ...e, role: 'hosting' as const })),
  ...attendingEvents
    .filter((e) => !hostedIds.has(e.id))
    .map((e) => ({ ...e, role: 'attending' as const })),
]

  const upcomingEvents = allEvents
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const pastEvents = allEvents
    .filter((e) => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">
            Hey {firstName} 🎉
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">
            {firstName[0].toUpperCase()}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/events/new">
          <div className="bg-primary/10 rounded-2xl p-4 space-y-2 hover:bg-primary/15 transition-colors">
            <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
              <CalendarPlus className="h-4 w-4 text-primary" />
            </div>
            <p className="font-semibold text-sm">Create event</p>
            <p className="text-xs text-muted-foreground">
              Plan something new
            </p>
          </div>
        </Link>
        <Link href="/events">
          <div className="bg-secondary rounded-2xl p-4 space-y-2 hover:bg-secondary/70 transition-colors">
            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm">My events</p>
            <p className="text-xs text-muted-foreground">
              See all your plans
            </p>
          </div>
        </Link>
      </div>

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">Coming up</h2>
            <Link
              href="/events"
              className="text-sm text-primary flex items-center gap-0.5"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 3).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                role={event.role}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past events */}
      {pastEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">Past events</h2>
            <Link
              href="/events"
              className="text-sm text-primary flex items-center gap-0.5"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {pastEvents.slice(0, 4).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="bg-secondary rounded-2xl p-4 space-y-1 hover:bg-secondary/70 transition-colors">
                  <p className="font-medium text-sm truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CalendarPlus className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold">No events yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first event or accept an invite
            </p>
          </div>
          <Button asChild>
            <Link href="/events/new">Create your first event</Link>
          </Button>
        </div>
      )}

    </div>
  )
}

function EventCard({
  event,
  role,
}: {
  event: {
    id: string
    title: string
    date: Date
    location?: string | null
    photosEnabled: boolean
    chatEnabled: boolean
  }
  role: 'hosting' | 'attending'
}) {
  const day = new Date(event.date).getDate()
  const month = new Date(event.date)
    .toLocaleDateString('en-GB', { month: 'short' })
    .toUpperCase()

  return (
    <Link href={`/events/${event.id}`}>
      <div className="border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        {/* Date block + badge */}
        <div
          className={`px-4 pt-4 pb-2 flex items-start justify-between ${
            role === 'hosting' ? 'bg-primary/5' : 'bg-pink-50 dark:bg-pink-950/20'
          }`}
        >
          <div className="bg-background rounded-xl px-3 py-2 text-center shadow-sm min-w-[52px]">
            <p className="text-lg font-bold leading-none">{day}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{month}</p>
          </div>
          <Badge
            className={
              role === 'hosting'
                ? 'bg-primary text-primary-foreground'
                : 'bg-pink-500 text-white border-0'
            }
          >
            {role === 'hosting' ? 'Hosting' : 'Attending'}
          </Badge>
        </div>

        {/* Event info */}
        <div className="px-4 pb-4 pt-3 space-y-2">
          <p className="font-semibold text-base leading-tight">
            {event.title}
          </p>
          {event.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Module tags */}
          {(event.photosEnabled || event.chatEnabled) && (
            <div className="flex gap-2 pt-1">
              {event.photosEnabled && (
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                  Photos
                </span>
              )}
              {event.chatEnabled && (
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                  Chat
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}