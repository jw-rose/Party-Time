'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { deletePhoto } from '@/server/actions/photo.actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Photo } from '@/server/db/schema'

interface PhotoGridProps {
  photos: Photo[]
  eventId: string
  currentUserId: string
  isHost: boolean
}

export function PhotoGrid({ photos, eventId, currentUserId, isHost }: PhotoGridProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(photoId: string) {
    setDeletingId(photoId)
    const result = await deletePhoto(photoId, eventId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Photo deleted')
      router.refresh()
    }
    setDeletingId(null)
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No photos yet</p>
        <p className="text-xs mt-1">Upload the first photo above</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square">
          <Image
            src={photo.url}
            alt="Event photo"
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover"
          />
          {(isHost || photo.uploadedBy === currentUserId) && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8 rounded-lg"
                onClick={() => handleDelete(photo.id)}
                disabled={deletingId === photo.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}