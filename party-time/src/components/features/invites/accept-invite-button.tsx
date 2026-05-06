'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInvite } from '@/server/actions/invite.actions'
import { Button } from '@/components/ui/button'

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAccept() {
    setLoading(true)
    setError('')

    const result = await acceptInvite(token)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result?.success && result.eventId) {
      router.push(`/events/${result.eventId}`)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAccept}
        disabled={loading}
        className="w-full h-12"
      >
        {loading ? 'Accepting...' : 'Accept invitation'}
      </Button>
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  )
}