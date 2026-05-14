'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { acceptInvite } from '@/server/actions/invite.actions'
import { Button } from '@/components/ui/button'
import { Check, Clock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface InviteRSVPProps {
  token: string
  inviteEmail: string
}

export function InviteRSVP({ token, inviteEmail }: InviteRSVPProps) {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleRSVP(status: 'going' | 'maybe' | 'declined') {
    setLoading(status)
    setError('')

    const result = await acceptInvite(token, status)

    if (result?.error) {
      setError(result.error)
      setLoading(null)
      return
    }

    if (result?.success && result.eventId) {
      router.push(`/events/${result.eventId}`)
    }
  }

  if (isPending) {
    return (
      <div className="space-y-3">
        <div className="h-12 bg-muted rounded-xl animate-pulse" />
        <div className="h-12 bg-muted rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="space-y-3">
        <Button asChild className="w-full h-12 rounded-xl font-medium">
          <Link href={`/register?invite=${token}`}>
            Create account to RSVP
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full h-12 rounded-xl"
        >
          <Link href={`/login?invite=${token}`}>
            Already have an account? Sign in
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={() => handleRSVP('going')}
        disabled={loading !== null}
        className="w-full h-12 rounded-xl font-medium"
      >
        <Check className="h-4 w-4 mr-2" />
        {loading === 'going' ? 'Accepting...' : "Yes, I'm going!"}
      </Button>
      <Button
        onClick={() => handleRSVP('maybe')}
        disabled={loading !== null}
        variant="outline"
        className="w-full h-12 rounded-xl font-medium"
      >
        <Clock className="h-4 w-4 mr-2" />
        {loading === 'maybe' ? 'Saving...' : "Maybe — I'll confirm later"}
      </Button>
      <Button
        onClick={() => handleRSVP('declined')}
        disabled={loading !== null}
        variant="ghost"
        className="w-full h-12 rounded-xl text-muted-foreground"
      >
        <X className="h-4 w-4 mr-2" />
        {loading === 'declined' ? 'Saving...' : "Can't make it"}
      </Button>
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  )
}