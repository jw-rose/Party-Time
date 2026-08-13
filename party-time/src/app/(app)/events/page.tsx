import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { getUserEventsInRange } from '@/server/dal/events.dal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarPlus } from 'lucide-react'
import { EventsCalendar } from '@/components/features/events/events-calendar'
import type { CalendarEventWithHost } from '@/components/features/events/events-calendar'

export default async function EventsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  const today = new Date()
  const gridStart = startOfWeek(startOfMonth(today), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(today), { weekStartsOn: 1 })

  let initialEvents: CalendarEventWithHost[] = []
  try {
    const rows = await getUserEventsInRange(gridStart, gridEnd)
    initialEvents = rows.map((e) => ({
      id: e.id,
      title: e.title,
      date: (e.date instanceof Date ? e.date : new Date(e.date)).toISOString(),
      location: e.location,
      hostName: e.hostName,
      isHost: e.isHost,
    }))
  } catch {
    // Non-fatal — calendar renders without existing events
  }

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

      <EventsCalendar initialEvents={initialEvents} />
    </div>
  )
}
