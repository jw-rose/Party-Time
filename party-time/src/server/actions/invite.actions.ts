'use server'

import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { invites, guests, events } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { inviteSchema } from '@/lib/validations'
import {
  generateInviteToken,
  generateExpiryDate,
  buildInviteUrl,
} from '@/server/services/invite.service'
import { sendInviteEmail } from '@/server/services/email.service'

// Send an invite
export async function sendInvite(eventId: string, formData: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  // Validate email
  const result = inviteSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { email } = result.data

  // Check user is host
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event) return { error: 'Event not found' }
  if (event.hostId !== session.user.id) return { error: 'Unauthorized' }

  // Generate token
  const token = generateInviteToken()
  const expiresAt = generateExpiryDate()
  const inviteUrl = buildInviteUrl(token)

  // Save invite
  await db.insert(invites).values({
    id: crypto.randomUUID(),
    eventId,
    createdBy: session.user.id,
    email,
    token,
    expiresAt,
  })

  // Send email
  try {
    await sendInviteEmail({
      to: email,
      inviteUrl,
      eventTitle: event.title,
      hostName: session.user.name,
    })
  } catch {
    // Log invite URL to terminal for dev testing
    console.log('📨 Invite URL (dev):', inviteUrl)
  }

  return { success: true }
}

// Accept an invite
export async function acceptInvite(
  token: string,
  status: 'going' | 'maybe' | 'declined' = 'going'
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  // Find invite
  const invite = await db.query.invites.findFirst({
    where: eq(invites.token, token),
  })

  if (!invite) return { error: 'Invite not found' }
  if (invite.usedAt) return { error: 'Invite already used' }
  if (new Date() > invite.expiresAt) return { error: 'Invite expired' }

  // Email binding check — case-insensitive to prevent false mismatches
  if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return { error: 'This invite was sent to a different email address' }
  }

  // Mark token as used
  await db
    .update(invites)
    .set({ usedAt: new Date() })
    .where(eq(invites.token, token))

  // Add to guests — check not already a guest
  const existingGuest = await db.query.guests.findFirst({
    where: and(
      eq(guests.eventId, invite.eventId),
      eq(guests.userId, session.user.id)
    ),
  })

  if (!existingGuest) {
    await db.insert(guests).values({
      id: crypto.randomUUID(),
      eventId: invite.eventId,
      userId: session.user.id,
      status,
    })
  } else {
    await db
      .update(guests)
      .set({ status, respondedAt: new Date() })
      .where(
        and(
          eq(guests.eventId, invite.eventId),
          eq(guests.userId, session.user.id)
        )
      )
  }

  return { success: true, eventId: invite.eventId }
}

// Revoke an invite
export async function revokeInvite(inviteId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  // Check user is host of the event
  const invite = await db.query.invites.findFirst({
    where: eq(invites.id, inviteId),
    with: { event: true },
  })

  if (!invite) return { error: 'Invite not found' }
  if (invite.event.hostId !== session.user.id) {
    return { error: 'Unauthorized' }
  }

  await db.delete(invites).where(eq(invites.id, inviteId))

  return { success: true }
}