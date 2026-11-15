import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ArrowUpRight, CalendarDays, CheckCircle2 } from 'lucide-react'
import type { Task } from '@/types'
import { CourseChip } from '@/components/tasks/CourseChip'
import { dueDayLabel, isOverdue } from '@/lib/date'
import { cn } from '@/lib/utils'

export function UpcomingDeadlines({ tasks }: { tasks: Task[] }) {
  const upcoming = [...tasks]
    .filter((task) => task.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4)

  return (
    <section className="card animate-rise overflow-hidden" style={{ animationDelay: '300ms' }}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-2">
        <div>
          <h2 className="text-[17px] font-bold tracking-tight">Upcoming deadlines</h2>
          <p className="mt-1 text-xs text-muted">The next few things on your plate.</p>
        </div>
        <Link
          to="/calendar"
          className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition hover:border-brand/30 hover:text-brand"
          aria-label="Open calendar"
        >
          <CalendarDays size={15} />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-9 text-center">
          <CheckCircle2 size={24} className="text-mint" />
          <p className="mt-2 text-sm font-bold">All caught up</p>
          <p className="mt-1 text-xs text-muted">No pending deadlines in sight.</p>
        </div>
      ) : (
        <div className="px-2.5 py-1">
          {upcoming.map((task) => {
            const date = parseISO(task.dueDate)
            const late = isOverdue(task.dueDate)
            const label = dueDayLabel(task.dueDate)
            const urgent = late || label === 'Today' || label === 'Tomorrow'

            return (
              <Link
                key={task.id}
                to="/tasks"
                className="focus-ring group flex items-center gap-3 rounded-xl px-2.5 py-3 transition hover:bg-surface-2"
              >
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border text-center transition-colors',
                    late
                      ? 'border-rose/20 bg-rose/10 text-rose'
                      : 'border-line bg-surface-2 text-ink group-hover:border-brand/25',
                  )}
                >
                  <span className="text-[9px] font-bold tracking-wider uppercase">{format(date, 'MMM')}</span>
                  <span className="text-sm leading-none font-extrabold tabular-nums">{format(date, 'd')}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{task.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <CourseChip courseId={task.courseId} />
                  </div>
                </div>

                <span
                  className={cn(
                    'shrink-0 rounded-md px-1.5 py-1 text-[10px] font-bold whitespace-nowrap',
                    late
                      ? 'bg-rose/10 text-rose'
                      : urgent
                        ? 'bg-amber/10 text-amber'
                        : 'bg-surface-2 text-faint',
                  )}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      )}

      <div className="border-t border-line px-5 py-3">
        <Link
          to="/calendar"
          className="focus-ring inline-flex items-center gap-1 rounded-md text-xs font-bold text-brand transition hover:gap-1.5"
        >
          Open calendar <ArrowUpRight size={13} />
        </Link>
      </div>
    </section>
  )
}
