import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/server/db'
import { invites, guests } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token, status = 'going' } = await request.json()

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const invite = await db.query.invites.findFirst({
    where: eq(invites.token, token),
  })

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  if (invite.usedAt) {
    return NextResponse.json({ error: 'Invite already used' }, { status: 400 })
  }

  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 400 })
  }

  if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'This invite was sent to a different email address' },
      { status: 403 }
    )
  }

  await db
    .update(invites)
    .set({ usedAt: new Date() })
    .where(eq(invites.token, token))

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

  return NextResponse.json({ success: true, eventId: invite.eventId })
}