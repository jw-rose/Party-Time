'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEventSchema, type CreateEventFormData } from '@/lib/validations'
import { createEvent } from '@/server/actions/event.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { CalendarDays, MapPin, ImageIcon, MessageCircle } from 'lucide-react'

export function CreateEventForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      photosEnabled: false,
      chatEnabled: false,
    },
  })

  const photosEnabled = watch('photosEnabled')
  const chatEnabled = watch('chatEnabled')

  async function onSubmit(data: CreateEventFormData) {
    setServerError('')

    const result = await createEvent(data)

    if (result?.error) {
      setServerError(result.error)
      return
    }

    if (result?.success && result.eventId) {
      router.push(`/events/${result.eventId}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create event</CardTitle>
        <CardDescription>
          Fill in the details and invite your friends
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Event name */}
          <div className="space-y-2">
            <Label htmlFor="title">Event name</Label>
            <Input
              id="title"
              placeholder="Rooftop Birthday Bash"
              disabled={isSubmitting}
              className="h-12 text-base"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Date and time */}
          <div className="space-y-2">
            <Label htmlFor="date">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date and time
              </span>
            </Label>
            <Input
              id="date"
              type="datetime-local"
              disabled={isSubmitting}
              className="h-12 text-base"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-destructive">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
                <span className="text-muted-foreground font-normal text-xs">
                  optional
                </span>
              </span>
            </Label>
            <Input
              id="location"
              placeholder="Rooftop Bar Marais, Paris"
              disabled={isSubmitting}
              className="h-12 text-base"
              {...register('location')}
            />
            {errors.location && (
              <p className="text-sm text-destructive">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description
              <span className="text-muted-foreground font-normal text-xs ml-2">
                optional
              </span>
            </Label>
            <Textarea
              id="description"
              placeholder="Smart casual dress code, bring your best moves..."
              disabled={isSubmitting}
              className="resize-none"
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Modules */}
          <div className="space-y-4">
            <Label>Enable features</Label>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Photos</p>
                  <p className="text-xs text-muted-foreground">
                    Guests can upload photos
                  </p>
                </div>
              </div>
              <Switch
                checked={photosEnabled}
                onCheckedChange={(val: boolean) =>
                  setValue('photosEnabled', val)
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Group chat</p>
                  <p className="text-xs text-muted-foreground">
                    Real-time messaging for all guests
                  </p>
                </div>
              </div>
              <Switch
                checked={chatEnabled}
                onCheckedChange={(val: boolean) =>
                  setValue('chatEnabled', val)
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating event...' : 'Create event'}
          </Button>

        </form>
      </CardContent>
    </Card>
  )
}