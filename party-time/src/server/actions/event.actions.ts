'use server'

import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { events } from '@/server/db/schema'
import { createEventSchema } from '@/lib/validations'
import { headers } from 'next/headers'

export async function createEvent(formData: unknown) {
  // 1. Check session
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: 'Unauthorized' }
  }

  // 2. Validate with Zod
  const result = createEventSchema.safeParse(formData)

  if (!result.success) {
    return {
      error: result.error.issues[0].message,
    }
  }

  // 3. Insert to database
  const id = crypto.randomUUID()

  await db.insert(events).values({
    id,
    hostId: session.user.id,
    title: result.data.title,
    description: result.data.description ?? null,
    date: new Date(result.data.date),
    location: result.data.location ?? null,
    photosEnabled: result.data.photosEnabled,
    chatEnabled: result.data.chatEnabled,
  })

  // 4. Return the ID — redirect handled client side
  return { success: true, eventId: id }
}