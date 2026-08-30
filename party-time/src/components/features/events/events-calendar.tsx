'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { getCalendarEvents } from '@/server/actions/event.actions'
import { formatEventDateKey, formatEventTime } from '@/lib/date-format'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

export interface CalendarEventWithHost {
  id: string
  title: string
  date: string
  location: string | null
  hostName: string
  isHost: boolean
}

interface EventsCalendarProps {
  initialEvents: CalendarEventWithHost[]
  initialMonth?: Date
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function EventsCalendar({ initialEvents, initialMonth }: EventsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth ?? new Date())
  const [displayedEvents, setDisplayedEvents] = useState<CalendarEventWithHost[]>(initialEvents)
  const [isPending, startTransition] = useTransition()
  const [openDay, setOpenDay] = useState<string | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  function eventsForDay(day: Date): CalendarEventWithHost[] {
    const key = format(day, 'yyyy-MM-dd')
    return displayedEvents
      .filter((e) => formatEventDateKey(e.date) === key)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  function navigateMonth(dir: 1 | -1) {
    const next = dir === 1 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1)
    setCurrentMonth(next)
    setOpenDay(null)
    startTransition(async () => {
      const start = startOfWeek(startOfMonth(next), { weekStartsOn: 1 })
      const end = endOfWeek(endOfMonth(next), { weekStartsOn: 1 })
      const fetched = await getCalendarEvents(start.toISOString(), end.toISOString())
      setDisplayedEvents(fetched as CalendarEventWithHost[])
    })
  }

  return (
    <div
      className={`rounded-xl border border-border/60 overflow-hidden transition-opacity ${
        isPending ? 'opacity-60' : 'opacity-100'
      }`}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-2">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          aria-label="Previous month"
          className="rounded-lg p-1.5 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          aria-label="Next month"
          className="rounded-lg p-1.5 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 border-b border-border/60 bg-muted/20 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-status-hosting" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">Hosting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-status-attending" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">Attending</span>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-b border-border/60 bg-muted/20">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            className="py-1.5 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayKey = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsForDay(day)
          const inCurrentMonth = isSameMonth(day, currentMonth)
          const isLastInRow = (idx + 1) % 7 === 0
          const hasEvents = dayEvents.length > 0

          // Dot logic: show up to 2 dots; if >2 events show 1 dot + "+N more"
          const hasOverflow = dayEvents.length > 2
          const dotsToShow = hasOverflow ? dayEvents.slice(0, 1) : dayEvents.slice(0, 2)
          const overflowCount = hasOverflow ? dayEvents.length - 1 : 0

          const eventCount = dayEvents.length
          const ariaLabel = `${format(day, 'MMMM d, yyyy')}${eventCount > 0 ? `, ${eventCount} event${eventCount !== 1 ? 's' : ''}` : ''}`

          const cellBase = [
            'min-h-14 border-b p-1 text-left align-top flex flex-col',
            isLastInRow ? '' : 'border-r border-border/40',
            !inCurrentMonth ? 'opacity-40' : '',
          ].filter(Boolean).join(' ')

          if (!hasEvents) {
            return (
              <div key={dayKey} className={cellBase} aria-label={ariaLabel}>
                <span
                  className={[
                    'text-[11px] font-medium leading-none',
                    isToday(day)
                      ? 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]'
                      : 'text-foreground',
                  ].join(' ')}
                >
                  {format(day, 'd')}
                </span>
              </div>
            )
          }

          return (
            <Popover
              key={dayKey}
              open={openDay === dayKey}
              onOpenChange={(isOpen) => setOpenDay(isOpen ? dayKey : null)}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={ariaLabel}
                  className={[
                    cellBase,
                    'h-full cursor-pointer hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'text-[11px] font-medium leading-none',
                      isToday(day)
                        ? 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]'
                        : 'text-foreground',
                    ].join(' ')}
                  >
                    {format(day, 'd')}
                  </span>

                  <div className="flex-1 flex flex-col items-center justify-end pb-1 gap-0.5">
                    <div className="flex items-center gap-1" aria-hidden="true">
                      {dotsToShow.map((ev) => (
                        <span
                          key={ev.id}
                          className={`inline-block h-2 w-2 rounded-full ${
                            ev.isHost ? 'bg-status-hosting' : 'bg-status-attending'
                          }`}
                        />
                      ))}
                    </div>
                    {overflowCount > 0 && (
                      <span className="text-[10px] text-muted-foreground leading-none" aria-hidden="true">
                        +{overflowCount} more
                      </span>
                    )}
                  </div>
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-72 p-0" align="start">
                <div role="dialog" aria-label={`Events on ${format(day, 'MMMM d, yyyy')}`}>
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-sm font-medium">{format(day, 'EEEE, MMMM d')}</p>
                  </div>
                  <div className="divide-y divide-border/40">
                    {dayEvents.map((ev) => (
                      <Link
                        key={ev.id}
                        href={`/events/${ev.id}`}
                        className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{ev.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatEventTime(ev.date)}
                          </p>
                          {ev.location && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                              <p className="text-xs text-muted-foreground truncate">{ev.location}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ev.isHost ? "You're hosting" : `Hosted by ${ev.hostName}`}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 self-start text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                            ev.isHost
                              ? 'bg-status-hosting/10 text-status-hosting border-status-hosting/30'
                              : 'bg-status-attending/10 text-status-attending border-status-attending/30'
                          }`}
                        >
                          {ev.isHost ? 'Hosting' : 'Attending'}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )
        })}
      </div>
    </div>
  )
}
