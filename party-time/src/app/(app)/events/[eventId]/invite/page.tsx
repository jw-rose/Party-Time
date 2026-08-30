import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/server/db'
import { events, invites } from '@/server/db/schema'
import { eq, desc } from 'drizzle-orm'
import { InviteForm } from '@/components/features/invites/invite-form'
import { InviteList } from '@/components/features/invites/invite-list'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function InvitePage({
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

  if (!event) redirect('/dashboard')
  if (event.hostId !== session.user.id) redirect(`/events/${eventId}`)

  const pendingInvites = await db.query.invites.findMany({
    where: eq(invites.eventId, eventId),
    orderBy: [desc(invites.expiresAt)],
  })

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to event
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-bold">Invite guests</h1>
        <p className="text-muted-foreground mt-1">
          Send invites to {event.title}
        </p>
      </div>
      <InviteForm eventId={eventId} />
      <InviteList invites={pendingInvites} eventId={eventId} />
    </div>
  )
}