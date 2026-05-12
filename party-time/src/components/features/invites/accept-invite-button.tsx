'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInvite } from '@/server/actions/invite.actions'
import { Button } from '@/components/ui/button'
import { Check, Clock, X } from 'lucide-react'

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleAccept(status: 'going' | 'maybe' | 'declined') {
    setLoading(status)
    setError('')

    const result = await acceptInvite(token)

    if (result?.error) {
      setError(result.error)
      setLoading(null)
      return
    }

    if (result?.success && result.eventId) {
      router.push(`/events/${result.eventId}`)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={() => handleAccept('going')}
        disabled={loading !== null}
        className="w-full h-12 rounded-xl font-medium"
      >
        <Check className="h-4 w-4 mr-2" />
        {loading === 'going' ? 'Accepting...' : "Yes, I'm going!"}
      </Button>
      <Button
        onClick={() => handleAccept('maybe')}
        disabled={loading !== null}
        variant="outline"
        className="w-full h-12 rounded-xl font-medium"
      >
        <Clock className="h-4 w-4 mr-2" />
        {loading === 'maybe' ? 'Saving...' : 'Maybe — I\'ll confirm later'}
      </Button>
      <Button
        onClick={() => handleAccept('declined')}
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