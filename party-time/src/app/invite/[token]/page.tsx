import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { InvitePageClient } from '@/components/features/invites/invite-page-client'

export default async function InviteAcceptPage({
  params,
}: {
  params: { token: string }
}) {
  const { token } = params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect(`/register?invite=${token}`)
  }

  return <InvitePageClient token={token} />
}