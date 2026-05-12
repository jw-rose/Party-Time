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
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-sm mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">New event</h1>
          <p className="text-sm text-muted-foreground">
            Tell your crew what&apos;s happening
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex gap-1.5">
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-primary/30" />
            <div className="h-1 flex-1 rounded-full bg-primary/15" />
          </div>
          <p className="text-xs text-muted-foreground">
            Step 2 of 3 — Details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Event name */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Event name
            </Label>
            <Input
              id="title"
              placeholder="Rooftop Birthday Bash"
              disabled={isSubmitting}
              className="h-12 text-base px-4 rounded-xl border-border/60"
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
            <Label htmlFor="date" className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Date & time
              </span>
            </Label>
            <Input
              id="date"
              type="datetime-local"
              disabled={isSubmitting}
              className="h-12 text-base px-4 rounded-xl border-border/60"
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
            <Label htmlFor="location" className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
              </span>
            </Label>
            <Input
              id="location"
              placeholder="Rooftop Bar Marais, Paris"
              disabled={isSubmitting}
              className="h-12 text-base px-4 rounded-xl border-border/60"
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
            <Label htmlFor="description" className="text-sm font-medium">
              Description{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="description"
              placeholder="Smart casual dress code, rooftop bar..."
              disabled={isSubmitting}
              className="resize-none rounded-xl border-border/60 text-base"
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
          <div className="space-y-3">
            <Label className="text-sm font-medium">Enable modules</Label>

            {/* Photos toggle */}
            <button
              type="button"
              onClick={() => setValue('photosEnabled', !photosEnabled)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Photos</p>
                  <p className="text-xs text-muted-foreground">
                    Guests can upload photos
                  </p>
                </div>
              </div>
              <div
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 flex-shrink-0 ${
                  photosEnabled ? 'bg-primary' : 'bg-border'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    photosEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>

            {/* Chat toggle */}
            <button
              type="button"
              onClick={() => setValue('chatEnabled', !chatEnabled)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Group chat</p>
                  <p className="text-xs text-muted-foreground">
                    Real-time messaging
                  </p>
                </div>
              </div>
              <div
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 flex-shrink-0 ${
                  chatEnabled ? 'bg-primary' : 'bg-border'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    chatEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {serverError && (
            <p className="text-sm text-destructive text-center">
              {serverError}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 text-base rounded-xl font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create event'}
          </Button>

        </form>
      </div>
    </div>
  )
}