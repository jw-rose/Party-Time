import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/server/db'
import { invites } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const invite = await db.query.invites.findFirst({
    where: eq(invites.token, token),
    with: { event: true },
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

  return NextResponse.json({
    token: invite.token,
    email: invite.email,
    expiresAt: invite.expiresAt,
    event: {
      id: invite.event.id,
      title: invite.event.title,
      description: invite.event.description,
      date: invite.event.date,
      location: invite.event.location,
    },
  })
}