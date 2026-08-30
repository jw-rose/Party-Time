'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateEventSchema, type UpdateEventFormData } from '@/lib/validations'
import { updateEvent, deleteEvent } from '@/server/actions/event.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EventDateCalendar } from '@/components/features/events/event-date-calendar'
import { formatEventDateKey, formatEventTime } from '@/lib/date-format'
import { CalendarDays, MapPin, ImageIcon, MessageCircle, Trash2 } from 'lucide-react'
import type { Event } from '@/server/db/schema'

interface EditEventFormProps {
  event: Event
  initialEvents: { id: string; title: string; date: string }[]
}

export function EditEventForm({ event, initialEvents }: EditEventFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Derive the initial picker values from the stored UTC instant, evaluated in
  // the event's display zone (Europe/Paris) so they line up with what the rest
  // of the app shows. defaultValues.date below carries the exact stored instant
  // as an ISO string, so saving without touching the pickers is a no-op.
  const eventDateObj = new Date(event.date)
  const initialDate = formatEventDateKey(event.date)
  const [rawHH, rawMM] = formatEventTime(event.date).split(':').map(Number)
  // Snap to the nearest 15-minute increment so the Select always shows a value.
  const totalMin = rawHH * 60 + rawMM
  const snappedMin = Math.min(Math.round(totalMin / 15) * 15, 23 * 60 + 45)
  const initialTime = `${String(Math.floor(snappedMin / 60)).padStart(2, '0')}:${String(snappedMin % 60).padStart(2, '0')}`

  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate)
  const [selectedTime, setSelectedTime] = useState(initialTime)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateEventFormData>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      title: event.title,
      description: event.description ?? '',
      date: eventDateObj.toISOString(),
      location: event.location ?? '',
      photosEnabled: event.photosEnabled,
      chatEnabled: event.chatEnabled,
    },
  })

  const photosEnabled = watch('photosEnabled')
  const chatEnabled = watch('chatEnabled')

  function handleDateSelect(date: string) {
    setSelectedDate(date)
    const localDate = new Date(`${date}T${selectedTime}`)
    setValue('date', localDate.toISOString(), { shouldValidate: true })
  }

  function handleTimeChange(time: string) {
    setSelectedTime(time)
    if (selectedDate) {
      const localDate = new Date(`${selectedDate}T${time}`)
      setValue('date', localDate.toISOString(), { shouldValidate: true })
    }
  }

  async function onSubmit(data: UpdateEventFormData) {
    setServerError('')
    const result = await updateEvent(event.id, data)

    if (result?.error) {
      setServerError(result.error)
      return
    }

    router.push(`/events/${event.id}`)
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteEvent(event.id)

    if (result?.error) {
      setServerError(result.error)
      setDeleting(false)
      setDeleteOpen(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit event</CardTitle>
          <CardDescription>
            Update the details for {event.title}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Event name */}
            <div className="space-y-2">
              <Label htmlFor="title">Event name</Label>
              <Input
                id="title"
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

            {/* Date & time */}
            <div className="space-y-2">
              <Label>
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Date &amp; time
                </span>
              </Label>

              <EventDateCalendar
                initialEvents={initialEvents}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                initialMonth={eventDateObj}
                excludeEventId={event.id}
                disabled={isSubmitting}
              />

              <div className="flex items-center gap-3 pt-1">
                <Label className="text-sm font-medium shrink-0">Time</Label>
                <Select
                  value={selectedTime}
                  onValueChange={handleTimeChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    aria-label="Time"
                    className="h-10 w-28 rounded-xl border-primary bg-white text-base text-primary"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-64">
                    {Array.from({ length: 24 * 4 }, (_, i) => {
                      const totalMinutes = i * 15
                      const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
                      const m = String(totalMinutes % 60).padStart(2, '0')
                      const value = `${h}:${m}`
                      return (
                        <SelectItem
                          key={value}
                          value={value}
                          className="text-primary focus:bg-primary/10"
                        >
                          {value}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

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
              <Label>Features</Label>

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

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/events/${event.id}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">
            Danger zone
          </CardTitle>
          <CardDescription>
            Deleting this event is permanent and cannot be undone.
            All guests, invites and photos will be removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {event.title}?</DialogTitle>
                <DialogDescription>
                  This will permanently delete the event and remove all
                  guests, invites, and photos. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Yes, delete event'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

    </div>
  )
}
