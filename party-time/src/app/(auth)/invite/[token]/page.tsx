import { validateInviteToken } from '@/server/dal/invites.dal'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, MapPin } from 'lucide-react'
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
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <CardTitle>Invalid invite</CardTitle>
          <CardDescription>
            This invite link is invalid, expired, or has already been used.
            Ask the host to send you a new invite.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild variant="outline">
            <Link href="/login">Go to login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!session) {
    redirect(`/register?invite=${token}`)
  }

  const formattedDate = new Date(invite.event.date).toLocaleDateString(
    'en-GB',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  )

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="text-4xl mb-2">🎉</div>
        <CardTitle className="text-2xl">You are invited!</CardTitle>
        <CardDescription>
          You have been invited to join this event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-lg">{invite.event.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          {invite.event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{invite.event.location}</span>
            </div>
          )}
        </div>

        <AcceptInviteButton token={token} />

        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard">Maybe later</Link>
        </Button>
      </CardContent>
    </Card>
  )
}