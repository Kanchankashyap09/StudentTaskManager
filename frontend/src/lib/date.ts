import {
  differenceInCalendarDays,
  format,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
} from 'date-fns'

export function formatDueDate(value: string) {
  const date = parseISO(value)
  const time = format(date, 'h:mm a')

  if (isToday(date)) return `Today · ${time}`
  if (isTomorrow(date)) return `Tomorrow · ${time}`

  const days = differenceInCalendarDays(date, new Date())
  if (days < 0) return `${format(date, 'MMM d')} · ${time}`

  return `${format(date, 'EEE, MMM d')} · ${time}`
}

export function isOverdue(value: string) {
  return parseISO(value) < startOfDay(new Date())
}

export function dueDayLabel(value: string) {
  const date = parseISO(value)
  const days = differenceInCalendarDays(date, new Date())
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 0) return `${Math.abs(days)}d late`
  return `${days}d left`
}

export function toDateInputValue(value: string | Date) {
  return format(typeof value === 'string' ? parseISO(value) : value, 'yyyy-MM-dd')
}
