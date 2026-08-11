import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/server/db'
import { events } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { getUserEventsInRange } from '@/server/dal/events.dal'
import { EditEventForm } from '@/components/features/events/edit-event-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditEventPage({
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

  // ← this is the critical host guard
  if (event.hostId !== session.user.id) {
    redirect(`/events/${eventId}`)
  }

  // Fetch calendar events for the month of the event being edited, excluding
  // the event itself so it doesn't appear as a conflict chip on its own calendar.
  const eventDate = new Date(event.date)
  const gridStart = startOfWeek(startOfMonth(eventDate), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(eventDate), { weekStartsOn: 1 })

  let initialEvents: { id: string; title: string; date: string }[] = []
  try {
    const rows = await getUserEventsInRange(gridStart, gridEnd)
    initialEvents = rows
      .filter((e) => e.id !== eventId)
      .map((e) => ({
        id: e.id,
        title: e.title,
        date: (e.date instanceof Date ? e.date : new Date(e.date)).toISOString(),
      }))
  } catch {
    // Non-fatal — calendar renders without existing events
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/events/${eventId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to event
        </Link>
      </Button>
      <EditEventForm event={event} initialEvents={initialEvents} />
    </div>
  )
}