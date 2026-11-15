import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { addDays, addWeeks, format, isSameDay, parseISO, startOfWeek, subWeeks } from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCourses } from '@/context/CoursesContext'
import { useTasks } from '@/context/TaskContext'
import { api } from '@/lib/api'
import { dueDayLabel } from '@/lib/date'
import { queryKeys } from '@/lib/queryKeys'
import { cn, withAlpha } from '@/lib/utils'

const typeLabels = {
  class: 'Lecture',
  lab: 'Lab',
  study: 'Study block',
} as const

export function CalendarPage() {
  const { tasks } = useTasks()
  const { getCourse } = useCourses()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))

  const scheduleQuery = useQuery({
    queryKey: queryKeys.schedule,
    queryFn: () => api.schedule.list(),
  })
  const schedule = scheduleQuery.data ?? []

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart])
  const today = new Date()

  const dueThisWeek = useMemo(() => {
    const start = weekStart.getTime()
    const end = addDays(weekStart, 7).getTime()
    return tasks
      .filter((task) => {
        const due = parseISO(task.dueDate).getTime()
        return task.status !== 'done' && due >= start && due < end
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [tasks, weekStart])

  return (
    <>
      <div className="animate-rise flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-faint uppercase">Plan ahead</p>
          <h1 className="mt-1.5 text-[30px] leading-tight font-extrabold tracking-[-0.02em]">Calendar</h1>
          <p className="mt-1.5 text-sm text-muted">
            {format(weekStart, 'MMMM d')} – {format(addDays(weekStart, 6), 'MMMM d, yyyy')} · class timetable and
            study blocks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            Today
          </Button>
          <div className="flex overflow-hidden rounded-xl border border-line bg-surface">
            <button
              onClick={() => setWeekStart((current) => subWeeks(current, 1))}
              className="focus-ring flex h-9 w-9 items-center justify-center text-muted transition hover:bg-surface-2 hover:text-ink"
              aria-label="Previous week"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={() => setWeekStart((current) => addWeeks(current, 1))}
              className="focus-ring flex h-9 w-9 items-center justify-center border-l border-line text-muted transition hover:bg-surface-2 hover:text-ink"
              aria-label="Next week"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {scheduleQuery.isError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-rose/25 bg-rose/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-[13px] font-bold text-rose">Could not load the class schedule</p>
            <p className="mt-0.5 text-xs text-muted">
              {scheduleQuery.error instanceof Error ? scheduleQuery.error.message : 'The API request failed.'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void scheduleQuery.refetch()}>
            Try again
          </Button>
        </div>
      )}

      <section className="card animate-rise overflow-hidden" style={{ animationDelay: '80ms' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <CalendarDays size={17} />
            </span>
            <div>
              <p className="text-sm font-bold">Weekly schedule</p>
              <p className="text-[11px] text-muted">{format(weekStart, 'MMMM yyyy')} · repeats weekly</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-muted">
            {(['class', 'lab', 'study'] as const).map((type) => (
              <span key={type} className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    type === 'class' ? 'bg-brand' : type === 'lab' ? 'bg-amber' : 'bg-mint',
                  )}
                />
                {typeLabels[type]}
              </span>
            ))}
          </div>
        </div>

        {scheduleQuery.isLoading ? (
          <div className="grid min-w-[840px] grid-cols-7 gap-2 p-3" aria-label="Loading schedule">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className="min-h-[250px] animate-pulse rounded-xl border border-line bg-surface-2/40"
              />
            ))}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[840px] grid-cols-7 gap-2 p-3">
            {days.map((day, index) => {
              const events = schedule.filter((event) => event.day === index).sort((a, b) => a.start.localeCompare(b.start))
              const isToday = isSameDay(day, today)

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'flex min-h-[250px] flex-col gap-2 rounded-xl border p-2',
                    isToday ? 'border-brand/30 bg-brand/[0.04]' : 'border-line bg-surface-2/40',
                  )}
                >
                  <div className="flex items-center justify-between px-0.5 py-0.5">
                    <span className={cn('text-[10px] font-bold tracking-[0.1em] uppercase', isToday ? 'text-brand' : 'text-faint')}>
                      {format(day, 'EEE')}
                    </span>
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold tabular-nums',
                        isToday ? 'bg-brand text-white shadow-sm' : 'text-muted',
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  {events.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line/80 py-6">
                      <span className="text-[10px] text-faint">Free day</span>
                    </div>
                  ) : (
                    events.map((event) => {
                      const course = getCourse(event.courseId)
                      const color = course?.color ?? '#8b6cff'
                      return (
                        <div
                          key={event.id}
                          className="rounded-lg border p-2.5 transition-transform duration-200 hover:-translate-y-0.5"
                          style={{
                            backgroundColor: withAlpha(color, 0.08),
                            borderColor: withAlpha(color, 0.22),
                          }}
                        >
                          <p className="text-[9.5px] font-bold tracking-wide" style={{ color }}>
                            {event.start} – {event.end}
                          </p>
                          <p className="mt-1 text-[11.5px] leading-snug font-bold">{event.title}</p>
                          <p className="mt-1 text-[9.5px] text-muted">
                            {course?.code} · {typeLabels[event.type]}
                          </p>
                        </div>
                      )
                    })
                  )}
                </div>
              )
            })}
          </div>
        </div>
        )}
      </section>

      <section className="card animate-rise overflow-hidden" style={{ animationDelay: '160ms' }}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div>
            <h2 className="text-[15px] font-bold">Due this week</h2>
            <p className="mt-0.5 text-[11px] text-muted">
              {dueThisWeek.length === 0 ? 'Nothing due — enjoy the breathing room.' : `${dueThisWeek.length} assignments and deadlines`}
            </p>
          </div>
          <Link to="/tasks" className="text-[11px] font-bold text-brand hover:underline">
            All tasks
          </Link>
        </div>

        {dueThisWeek.length > 0 ? (
          <div className="grid gap-x-6 gap-y-0 p-2.5 sm:grid-cols-2">
            {dueThisWeek.map((task) => {
              const course = getCourse(task.courseId)
              return (
                <Link
                  key={task.id}
                  to={`/tasks?course=${task.courseId}`}
                  className="focus-ring flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-surface-2"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold"
                    style={{
                      backgroundColor: withAlpha(course?.color ?? '#8b6cff', 0.12),
                      color: course?.color ?? '#8b6cff',
                    }}
                  >
                    {format(parseISO(task.dueDate), 'd')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold">{task.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-faint">
                      <Clock3 size={10} /> {format(parseISO(task.dueDate), 'EEE · h:mm a')} · {course?.code}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-surface-3 px-1.5 py-0.5 text-[9.5px] font-bold text-muted">
                    {dueDayLabel(task.dueDate)}
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-5 py-6 text-xs text-muted">
            <CalendarDays size={16} className="text-mint" /> Your week is clear of deadlines.
          </div>
        )}
      </section>
    </>
  )
}
