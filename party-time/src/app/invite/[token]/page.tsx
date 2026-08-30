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
    } catch {
      // Invalid/expired/used token — send to register; InvitePageClient will
      // display the appropriate error after auth. This redirect must not be
      // inside a nested try/catch or its NEXT_REDIRECT signal gets swallowed.
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