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

export function CreatePostForm({
  eventId,
  allowGuests = false,
  placeholder = 'Write an update...',
}: {
  eventId: string
  allowGuests?: boolean
  placeholder?: string
}) {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  })

  async function onSubmit(data: CreatePostFormData) {
    setServerError('')
    const result = await createPost(eventId, data, allowGuests)
    if (result?.error) {
      setServerError(result.error)
      return
    }
    reset()
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Textarea
            placeholder={placeholder}
            disabled={isSubmitting}
            className="rounded-xl resize-none"
            rows={3}
            {...register('content')}
          />
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content.message}</p>
          )}
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          <Button
            type="submit"
            size="sm"
            className="rounded-xl"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}