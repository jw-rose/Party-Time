import 'server-only'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) throw new Error('UNAUTHORIZED')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) throw new Error('NOT_FOUND')

  return user
}