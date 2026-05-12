'use client'

import { useState } from 'react'
import { updateRSVP } from '@/server/actions/guest.actions'
import { Button } from '@/components/ui/button'
import { Check, Clock, X } from 'lucide-react'

interface RSVPButtonProps {
  eventId: string
  currentStatus: 'going' | 'maybe' | 'declined' | 'pending'
}

export function RSVPButton({ eventId, currentStatus }: RSVPButtonProps) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleRSVP(newStatus: 'going' | 'maybe' | 'declined') {
    setLoading(true)
    const result = await updateRSVP(eventId, newStatus)
    if (result?.success) {
      setStatus(newStatus)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Your RSVP
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={status === 'going' ? 'default' : 'outline'}
          onClick={() => handleRSVP('going')}
          disabled={loading}
          className="flex-1"
        >
          <Check className="h-3 w-3 mr-1" />
          Going
        </Button>
        <Button
          size="sm"
          variant={status === 'maybe' ? 'default' : 'outline'}
          onClick={() => handleRSVP('maybe')}
          disabled={loading}
          className="flex-1"
        >
          <Clock className="h-3 w-3 mr-1" />
          Maybe
        </Button>
        <Button
          size="sm"
          variant={status === 'declined' ? 'destructive' : 'outline'}
          onClick={() => handleRSVP('declined')}
          disabled={loading}
          className="flex-1"
        >
          <X className="h-3 w-3 mr-1" />
          Can't go
        </Button>
      </div>
    </div>
  )
}