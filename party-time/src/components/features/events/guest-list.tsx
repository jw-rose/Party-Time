'use client'

import { useState } from 'react'
import { removeGuest } from '@/server/actions/guest.actions'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Guest, User } from '@/server/db/schema'

type GuestWithUser = Guest & { user: User }

interface GuestListProps {
  guests: GuestWithUser[]
  eventId: string
  isHost: boolean
  currentUserId: string
}

const statusConfig = {
  going: { label: 'Going', variant: 'default' as const },
  maybe: { label: 'Maybe', variant: 'secondary' as const },
  declined: { label: 'Declined', variant: 'destructive' as const },
  pending: { label: 'Pending', variant: 'outline' as const },
}

export function GuestList({
  guests,
  eventId,
  isHost,
  currentUserId,
}: GuestListProps) {
  const router = useRouter()
  const [removing, setRemoving] = useState<string | null>(null)

  async function handleRemove(guestUserId: string) {
    setRemoving(guestUserId)
    await removeGuest(eventId, guestUserId)
    router.refresh()
    setRemoving(null)
  }

  if (guests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No guests yet — send some invites!
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {guests.map((guest) => {
        const initials = guest.user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        const config = statusConfig[guest.status]
        const isCurrentUser = guest.userId === currentUserId

        return (
          <div
            key={guest.id}
            className="flex items-center gap-3 p-3 rounded-lg border"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {guest.user.name}
                {isCurrentUser && (
                  <span className="text-muted-foreground font-normal ml-1">
                    (you)
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {guest.user.email}
              </p>
            </div>

            <Badge variant={config.variant} className="flex-shrink-0">
              {config.label}
            </Badge>

            {isHost && !isCurrentUser && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemove(guest.userId)}
                disabled={removing === guest.userId}
                className="text-destructive hover:text-destructive text-xs flex-shrink-0"
              >
                Remove
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}