import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { events } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/features/events/event-card'
import { CalendarPlus } from 'lucide-react'

export default async function EventsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect('/login')

  const myEvents = await db
    .select()
    .from(events)
    .where(eq(events.hostId, session.user.id))
    .orderBy(events.date)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My events</h1>
          <p className="text-muted-foreground mt-1">
            Events you are hosting
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
              isHost={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}