import 'server-only'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { invites } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import {
  isTokenExpired,
  isTokenUsed,
} from '@/server/services/invite.service'

// Get and validate an invite token
export async function validateInviteToken(token: string) {
  const invite = await db.query.invites.findFirst({
    where: eq(invites.token, token),
    with: {
      event: true,
    },
  })

  if (!invite) {
    throw new Error('INVITE_NOT_FOUND')
  }

  if (isTokenExpired(invite.expiresAt)) {
    throw new Error('INVITE_EXPIRED')
  }

  if (isTokenUsed(invite.usedAt)) {
    throw new Error('INVITE_ALREADY_USED')
  }

  return invite
}

// Get all invites for an event
export async function getEventInvites(eventId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) throw new Error('UNAUTHORIZED')

  return db.query.invites.findMany({
    where: eq(invites.eventId, eventId),
  })
}