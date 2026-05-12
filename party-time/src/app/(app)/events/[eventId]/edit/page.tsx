import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/server/db'
import { events } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
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

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/events/${eventId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to event
        </Link>
      </Button>
      <EditEventForm event={event} />
    </div>
  )
}