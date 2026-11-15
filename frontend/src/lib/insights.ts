import { addDays, format, parseISO, startOfDay, startOfWeek, subWeeks } from 'date-fns'
import type { ActivityPoint, Task } from '@/types'

export interface SparklineSet {
  completed: number[]
  active: number[]
  overdue: number[]
  streak: number[]
}

export interface DashboardInsights {
  activity: ActivityPoint[]
  sparks: SparklineSet
  completedTrend: number
  hoursTrend: number
  activeTrend: number
  overdueTrend: number
}

function toHours(minutes: number) {
  return Math.round((minutes / 60) * 10) / 10
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

/** Completed tasks and focus hours for the trailing `days` days. */
export function buildActivity(tasks: Task[], days = 7): ActivityPoint[] {
  const today = startOfDay(new Date())
  const buckets = new Map<string, { tasks: number; minutes: number }>()

  const points = Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - days + 1)
    const key = format(date, 'yyyy-MM-dd')
    buckets.set(key, { tasks: 0, minutes: 0 })
    return { key, day: format(date, 'EEE') }
  })

  for (const task of tasks) {
    if (task.status !== 'done' || !task.completedAt) continue
    const bucket = buckets.get(format(parseISO(task.completedAt), 'yyyy-MM-dd'))
    if (!bucket) continue
    bucket.tasks += 1
    bucket.minutes += task.estimateMinutes
  }

  return points.map(({ key, day }) => {
    const bucket = buckets.get(key)!
    return { day, tasks: bucket.tasks, hours: toHours(bucket.minutes) }
  })
}

/**
 * Reconstructs plausible daily snapshots from task history so the stat-card
 * sparklines reflect real data instead of static mock numbers.
 */
export function buildDashboardInsights(tasks: Task[], sparkDays = 12): DashboardInsights {
  const today = startOfDay(new Date())
  const sparkStart = addDays(today, -(sparkDays - 1))
  const sparks: SparklineSet = { completed: [], active: [], overdue: [], streak: [] }
  let runningStreak = 0

  for (let index = 0; index < sparkDays; index += 1) {
    const dayStart = addDays(sparkStart, index).getTime()
    const dayEnd = addDays(sparkStart, index + 1).getTime()
    let completed = 0
    let active = 0
    let overdue = 0

    for (const task of tasks) {
      const created = parseISO(task.createdAt).getTime()
      if (created >= dayEnd) continue

      const completedAt = task.completedAt ? parseISO(task.completedAt).getTime() : null
      const doneByDayEnd = completedAt !== null && completedAt < dayEnd
      const doneByDayStart = completedAt !== null && completedAt < dayStart

      if (completedAt !== null && completedAt >= dayStart && completedAt < dayEnd) completed += 1
      if (!doneByDayEnd) active += 1
      if (!doneByDayStart && parseISO(task.dueDate).getTime() < dayStart) overdue += 1
    }

    sparks.completed.push(completed)
    sparks.active.push(active)
    sparks.overdue.push(overdue)
    runningStreak = completed > 0 ? runningStreak + 1 : 0
    sparks.streak.push(runningStreak)
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const previousWeekStart = subWeeks(weekStart, 1)
  const thisWeekCompletedTasks = tasks.filter(
    (task) => task.status === 'done' && task.completedAt && parseISO(task.completedAt) >= weekStart,
  )
  const lastWeekCompletedTasks = tasks.filter(
    (task) =>
      task.status === 'done' &&
      task.completedAt &&
      parseISO(task.completedAt) >= previousWeekStart &&
      parseISO(task.completedAt) < weekStart,
  )
  const thisWeekCompleted = thisWeekCompletedTasks.length
  const lastWeekCompleted = lastWeekCompletedTasks.length
  const thisWeekMinutes = thisWeekCompletedTasks.reduce((sum, task) => sum + task.estimateMinutes, 0)
  const lastWeekMinutes = lastWeekCompletedTasks.reduce((sum, task) => sum + task.estimateMinutes, 0)

  const weekStartTime = weekStart.getTime()
  const activeLastWeek = tasks.filter((task) => {
    if (parseISO(task.createdAt).getTime() >= weekStartTime) return false
    if (!task.completedAt) return true
    return parseISO(task.completedAt).getTime() >= weekStartTime
  }).length
  const activeNow = tasks.filter((task) => task.status !== 'done').length

  const overdueLastWeek = tasks.filter((task) => {
    const created = parseISO(task.createdAt).getTime()
    const due = parseISO(task.dueDate).getTime()
    if (created >= weekStartTime || due >= weekStartTime) return false
    if (!task.completedAt) return true
    return parseISO(task.completedAt).getTime() >= weekStartTime
  }).length
  const overdueNow = tasks.filter(
    (task) => task.status !== 'done' && parseISO(task.dueDate).getTime() < today.getTime(),
  ).length

  return {
    activity: buildActivity(tasks),
    sparks,
    completedTrend: percentChange(thisWeekCompleted, lastWeekCompleted),
    hoursTrend: percentChange(thisWeekMinutes, lastWeekMinutes),
    activeTrend: percentChange(activeNow, activeLastWeek),
    overdueTrend: percentChange(overdueNow, overdueLastWeek),
  }
}
