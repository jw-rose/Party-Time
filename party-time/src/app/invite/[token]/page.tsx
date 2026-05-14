import { validateInviteToken } from '@/server/dal/invites.dal'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { CalendarDays, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AcceptInviteButton } from '@/components/features/invites/accept-invite-button'

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  let invite

  try {
    invite = await validateInviteToken(token)
  } catch {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Invalid invite</h2>
            <p className="text-sm text-muted-foreground mt-2">
              This invite link is invalid, expired, or has already been used.
              Ask the host to send you a new invite.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect(`/register?invite=${token}`)
  }

  // Calculate time remaining
  const hoursLeft = Math.max(
    0,
    Math.round(
      (new Date(invite.expiresAt).getTime() - Date.now()) / 1000 / 60 / 60
    )
  )

  const formattedDate = new Date(invite.event.date).toLocaleDateString(
    'en-GB',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  )

  const formattedTime = new Date(invite.event.date).toLocaleTimeString(
    'en-GB',
    { hour: '2-digit', minute: '2-digit' }
  )

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="w-full max-w-sm mx-auto space-y-6">

        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <div className="w-7 h-7 border-[3px] border-white/90 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white/90 rounded-full" />
            </div>
          </div>
        </div>

        {/* You are invited badge */}
        <div className="flex justify-end">
          <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
            You&apos;re invited
          </span>
        </div>

        {/* Invited by */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Someone invited you to
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {invite.event.title}
          </h1>
          {invite.event.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {invite.event.description}
            </p>
          )}
        </div>

        {/* Valid badge + expiry */}
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Valid invite link
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Expires in {hoursLeft}h</span>
          </div>
        </div>

        {/* Event details card */}
        <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{formattedDate}</p>
              <p className="text-xs text-muted-foreground">
                {formattedTime}
              </p>
            </div>
          </div>
          {invite.event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{invite.event.location}</p>
            </div>
          )}
          {invite.event.description && (
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {invite.event.description}
              </p>
            </div>
          )}
        </div>

        {/* RSVP section */}
        <div className="space-y-3">
          <p className="text-sm font-medium">RSVP</p>
          <AcceptInviteButton token={token} />
        </div>

        {/* Maybe later */}
        <Button
          asChild
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          <Link href="/dashboard">Maybe later</Link>
        </Button>

      </div>
    </div>
  )
}