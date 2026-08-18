'use client'

import { useRouter } from 'next/navigation'
import { UploadDropzone } from '@/lib/uploadthing'
import { toast } from 'sonner'

export function PhotoUpload({ eventId }: { eventId: string }) {
  const router = useRouter()

  return (
    <UploadDropzone
      endpoint="eventPhotoUploader"
      input={{ eventId }}
      onClientUploadComplete={() => {
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
