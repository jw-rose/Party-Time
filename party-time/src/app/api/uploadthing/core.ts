import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/server/db'
import { photos, guests, events } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const f = createUploadthing()

export const ourFileRouter = {
  eventPhotoUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 10,
    },
  })
    .input(z.object({ eventId: z.string().min(1) }))
    .middleware(async ({ input }) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session) throw new Error('Unauthorized')

      const event = await db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      })

      if (!event) throw new Error('Event not found')

      const isHost = event.hostId === session.user.id

      if (!isHost) {
        const guest = await db.query.guests.findFirst({
          where: and(
            eq(guests.eventId, input.eventId),
            eq(guests.userId, session.user.id)
          ),
        })

        if (!guest) throw new Error('Forbidden')
        if (!event.photosEnabled) throw new Error('Photos are disabled for this event')
      }

      return { userId: session.user.id, eventId: input.eventId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.insert(photos).values({
        id: crypto.randomUUID(),
        eventId: metadata.eventId,
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        key: file.key,
      })

      revalidatePath(`/events/${metadata.eventId}`)
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
