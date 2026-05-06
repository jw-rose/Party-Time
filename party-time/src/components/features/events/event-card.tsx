import Link from 'next/link'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/server/db/schema'

interface EventCardProps {
  event: Event
  isHost: boolean
}

export function EventCard({ event, isHost }: EventCardProps) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const formattedTime = new Date(event.date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg leading-tight">
              {event.title}
            </h3>
            <Badge variant={isHost ? 'default' : 'secondary'}>
              {isHost ? 'Hosting' : 'Attending'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 flex-shrink-0" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}