import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { InvitePageClient } from '@/components/features/invites/invite-page-client'
import { validateInviteToken } from '@/server/dal/invites.dal'
import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    // Only the token validation may legitimately throw (invalid/expired/used).
    // Keep it — and nothing else — inside the try.
    let invite: Awaited<ReturnType<typeof validateInviteToken>>
    try {
      invite = await validateInviteToken(token)
    } catch (err) {
      // An already-used token means this invite was already accepted, which
      // requires an active session — so a registered account for this email is
      // guaranteed to exist. Send them to log in rather than to register.
      if (err instanceof Error && err.message === 'INVITE_ALREADY_USED') {
        redirect(`/login?callbackUrl=/invite/${token}`)
      }
      // Invalid or expired token — send to register; InvitePageClient will
      // display the appropriate error after auth. Neither redirect here is
      // nested in a further try/catch, so its NEXT_REDIRECT is not swallowed.
      redirect(`/register?callbackUrl=/invite/${token}`)
    }

    // Existing-account lookup runs outside the try so a NEXT_REDIRECT thrown
    // by the redirect() calls below is never caught here.
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, invite.email.toLowerCase()),
    })

    if (existingUser) {
      redirect(`/login?callbackUrl=/invite/${token}`)
    }

    redirect(`/register?callbackUrl=/invite/${token}`)
  }

  return <InvitePageClient token={token} />
}