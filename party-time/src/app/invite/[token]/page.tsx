import { InvitePageClient } from '@/components/features/invites/invite-page-client'

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return <InvitePageClient token={token} />
}