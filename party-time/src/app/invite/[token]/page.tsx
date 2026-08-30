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
    try {
      const invite = await validateInviteToken(token)
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, invite.email.toLowerCase()),
      })
      if (existingUser) {
        redirect(`/login?callbackUrl=/invite/${token}`)
      }
    } catch {
      // Invalid/expired/used token — fall through to register redirect;
      // InvitePageClient will display the appropriate error after auth.
    }
    redirect(`/register?callbackUrl=/invite/${token}`)
  }

  return <InvitePageClient token={token} />
}