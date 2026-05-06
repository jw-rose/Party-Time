'use client'

import { revokeInvite } from '@/server/actions/invite.actions'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Invite } from '@/server/db/schema'

export function InviteList({
  invites,
  eventId,
}: {
  invites: Invite[]
  eventId: string
}) {
  const router = useRouter()

  async function handleRevoke(inviteId: string) {
    await revokeInvite(inviteId)
    router.refresh()
  }

  if (invites.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          No invites sent yet
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pending invites</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invites.map((invite) => {
          const isExpired = new Date() > invite.expiresAt
          const isUsed = invite.usedAt !== null

          return (
            <div
              key={invite.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{invite.email}</p>
                <p className="text-xs text-muted-foreground">
                  {isUsed
                    ? 'Accepted'
                    : isExpired
                    ? 'Expired'
                    : `Expires in 48h`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    isUsed
                      ? 'default'
                      : isExpired
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {isUsed ? 'Used' : isExpired ? 'Expired' : 'Pending'}
                </Badge>
                {!isUsed && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRevoke(invite.id)}
                    className="text-destructive hover:text-destructive text-xs"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}