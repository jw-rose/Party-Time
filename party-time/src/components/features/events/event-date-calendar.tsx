'use client'

import { useState, useTransition } from 'react'
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
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getCalendarEvents } from '@/server/actions/event.actions'

interface CalendarEvent {
  id: string
  title: string
  date: string
}

interface EventDateCalendarProps {
  initialEvents: CalendarEvent[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  minDate?: string
  disabled?: boolean
  excludeEventId?: string
  initialMonth?: Date
}

const MAX_CHIPS = 2
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function EventDateCalendar({
  initialEvents,
  selectedDate,
  onSelectDate,
  minDate,
  disabled,
  excludeEventId,
  initialMonth,
}: EventDateCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth ?? new Date())
  const [displayedEvents, setDisplayedEvents] = useState<CalendarEvent[]>(initialEvents)
  const [isPending, startTransition] = useTransition()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  function eventsForDay(day: Date): CalendarEvent[] {
    const key = format(day, 'yyyy-MM-dd')
    return displayedEvents.filter(
      (e) =>
        format(new Date(e.date), 'yyyy-MM-dd') === key &&
        (!excludeEventId || e.id !== excludeEventId)
    )
  }

  function navigateMonth(dir: 1 | -1) {
    const next = dir === 1 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1)
    setCurrentMonth(next)
    startTransition(async () => {
      const start = startOfWeek(startOfMonth(next), { weekStartsOn: 1 })
      const end = endOfWeek(endOfMonth(next), { weekStartsOn: 1 })
      const fetched = await getCalendarEvents(start.toISOString(), end.toISOString())
      setDisplayedEvents(fetched)
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
          disabled={disabled}
          aria-label="Previous month"
          className="rounded-lg p-1.5 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          disabled={disabled}
          aria-label="Next month"
          className="rounded-lg p-1.5 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
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
          const isDisabled = !!disabled || (minDate ? dayKey < minDate : false)
          const isSelected = selectedDate === dayKey
          const isLastInRow = (idx + 1) % 7 === 0
          const visible = dayEvents.slice(0, MAX_CHIPS)
          const overflowCount = dayEvents.length - visible.length

          return (
            <button
              key={dayKey}
              type="button"
              disabled={isDisabled}
              aria-selected={isSelected}
              aria-disabled={isDisabled}
              aria-label={format(day, 'EEEE, MMMM d, yyyy')}
              onClick={() => { if (!isDisabled) onSelectDate(dayKey) }}
              className={[
                'min-h-14 border-b p-1 text-left align-top transition-colors',
                isLastInRow ? '' : 'border-r border-border/40',
                isDisabled
                  ? 'cursor-not-allowed bg-muted/30'
                  : 'cursor-pointer hover:bg-muted/40',
                !inCurrentMonth && !isDisabled ? 'opacity-40' : '',
                isSelected ? 'bg-primary/5 ring-2 ring-inset ring-primary/50' : '',
              ].filter(Boolean).join(' ')}
            >
              <span
                className={[
                  'text-[11px] font-medium leading-none',
                  isDisabled
                    ? 'text-muted-foreground/40'
                    : isToday(day)
                    ? 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]'
                    : 'text-foreground',
                ].join(' ')}
              >
                {format(day, 'd')}
              </span>

              {!isDisabled && dayEvents.length > 0 && (
                <div className="mt-0.5 space-y-0.5">
                  {visible.map((ev, i) => (
                    <div
                      key={ev.id}
                      title={ev.title}
                      className={`truncate rounded border px-1 py-0.5 text-[9px] font-medium leading-tight ${
                        i === 0
                          ? 'bg-chart-1/10 border-chart-1/30 text-chart-1'
                          : 'bg-chart-2/10 border-chart-2/30 text-chart-2'
                      }`}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {overflowCount > 0 && (
                    <div className="px-1 text-[9px] text-muted-foreground">
                      +{overflowCount} more
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
