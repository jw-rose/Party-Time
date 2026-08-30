// Centralised event date/time formatting.
//
// Event timestamps round-trip through the database as UTC instants. Every
// display site must render them in the event's fixed local zone, otherwise
// React Server Components format them in the server's UTC zone and show a
// 2-hour offset. All helpers here pin `timeZone` to Europe/Paris explicitly.

const TIME_ZONE = 'Europe/Paris'

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

// Human-readable date. Pass `options` to match a specific call site's shape;
// `timeZone` is always forced to Europe/Paris.
export function formatEventDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS,
): string {
  return toDate(date).toLocaleDateString('en-GB', {
    ...options,
    timeZone: TIME_ZONE,
  })
}

// Human-readable time, e.g. "15:00" (24-hour, matches date-fns 'HH:mm').
export function formatEventTime(date: Date | string): string {
  return toDate(date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  })
}

// Calendar bucket key in the same shape as date-fns `format(d, 'yyyy-MM-dd')`,
// but evaluated in Europe/Paris rather than the runtime zone.
export function formatEventDateKey(date: Date | string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(toDate(date))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}
