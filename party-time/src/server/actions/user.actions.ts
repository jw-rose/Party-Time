'use server'

import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { users, events, guests, invites, eventPosts } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
})

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase and a number'
      ),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export async function updateProfile(formData: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  const result = updateProfileSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  await db
    .update(users)
    .set({
      name: result.data.name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id))

  revalidatePath('/settings')
  return { success: true }
}

export async function changePassword(formData: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  const result = changePasswordSchema.safeParse(formData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword,
      },
      headers: await headers(),
    })
  } catch {
    return { error: 'Current password is incorrect' }
  }

  return { success: true }
}

export async function deleteAccount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return { error: 'Unauthorized' }

  const userId = session.user.id

  // RGPD cascade delete — remove all user data in order
  // 1. Delete event posts
  await db.delete(eventPosts).where(eq(eventPosts.authorId, userId))

  // 2. Delete invites created by user
  await db.delete(invites).where(eq(invites.createdBy, userId))

  // 3. Delete guest records
  await db.delete(guests).where(eq(guests.userId, userId))

  // 4. Delete events hosted by user
  // (cascade will handle guests, invites, posts for these events)
  await db.delete(events).where(eq(events.hostId, userId))

  // 5. Delete the user account
  // (cascade will handle sessions and accounts)
  await db.delete(users).where(eq(users.id, userId))

  return { success: true }
}