import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { getUserEventsInRange } from '@/server/dal/events.dal'
import { CreateEventForm } from '@/components/features/events/create-event-form'

export default async function NewEventPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const today = new Date()
  const gridStart = startOfWeek(startOfMonth(today), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(today), { weekStartsOn: 1 })

  let initialEvents: { id: string; title: string; date: string }[] = []
  try {
    const rows = await getUserEventsInRange(gridStart, gridEnd)
    initialEvents = rows.map((e) => ({
      id: e.id,
      title: e.title,
      date: (e.date instanceof Date ? e.date : new Date(e.date)).toISOString(),
    }))
  } catch {
    // Non-fatal — calendar renders without existing events
  }

  return <CreateEventForm initialEvents={initialEvents} />
}
