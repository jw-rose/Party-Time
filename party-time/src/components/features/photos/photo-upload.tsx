'use client'

import { useRouter } from 'next/navigation'
import { UploadDropzone } from '@/lib/uploadthing'
import { savePhoto } from '@/server/actions/photo.actions'
import { toast } from 'sonner'

export function PhotoUpload({ eventId }: { eventId: string }) {
  const router = useRouter()

  return (
    <UploadDropzone
      endpoint="eventPhotoUploader"
      onClientUploadComplete={async (res) => {
        for (const file of res) {
          await savePhoto(eventId, file.url, file.key)
        }
        toast.success('Photos uploaded successfully')
        router.refresh()
      }}
      onUploadError={(error) => {
        toast.error(`Upload failed: ${error.message}`)
      }}
      appearance={{
        container: 'border-2 border-dashed border-border rounded-xl p-8',
        label: 'text-sm text-muted-foreground',
        button: 'bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm',
      }}
    />
  )
}