'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inviteSchema, type InviteFormData } from '@/lib/validations'
import { sendInvite } from '@/server/actions/invite.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send } from 'lucide-react'

export function InviteForm({ eventId }: { eventId: string }) {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  })

  async function onSubmit(data: InviteFormData) {
    setServerError('')
    setSuccess(false)

    const result = await sendInvite(eventId, data)

    if (result?.error) {
      setServerError(result.error)
      return
    }

    setSuccess(true)
    reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Send invite by email</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                disabled={isSubmitting}
                className="h-11"
                {...register('email')}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-4 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {success && (
            <p className="text-sm text-green-600">
              Invite sent successfully!
            </p>
          )}

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}