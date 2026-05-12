'use client'

import { useState } from 'react'
import { deletePost } from '@/server/actions/post.actions'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trash2 } from 'lucide-react'
import type { EventPost, User } from '@/server/db/schema'

type PostWithAuthor = EventPost & { author: User }

interface EventPostProps {
  post: PostWithAuthor
  isHost: boolean
  eventId: string
}

export function EventPostCard({ post, isHost, eventId }: EventPostProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const initials = post.author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  async function handleDelete() {
    setDeleting(true)
    await deletePost(post.id, eventId)
    router.refresh()
    setDeleting(false)
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {post.author.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formattedDate}
                </span>
              </div>
              {isHost && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-destructive hover:text-destructive h-6 w-6 p-0 flex-shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}