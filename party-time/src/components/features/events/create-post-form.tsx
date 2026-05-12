'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPostSchema, type CreatePostFormData } from '@/lib/validations'
import { createPost } from '@/server/actions/post.actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CreatePostForm({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  })

  const content = watch('content') ?? ''

  async function onSubmit(data: CreatePostFormData) {
    setServerError('')
    const result = await createPost(eventId, data)

    if (result?.error) {
      setServerError(result.error)
      return
    }

    reset()
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Post a message</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-2">
            <Textarea
              placeholder="Write a message for your guests..."
              disabled={isSubmitting}
              className="resize-none"
              rows={3}
              {...register('content')}
            />
            <div className="flex items-center justify-between">
              <div>
                {errors.content && (
                  <p className="text-sm text-destructive">
                    {errors.content.message}
                  </p>
                )}
                {serverError && (
                  <p className="text-sm text-destructive">{serverError}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {content.length}/1000
              </span>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Posting...' : 'Post message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}