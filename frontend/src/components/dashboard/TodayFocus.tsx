import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ArrowRight, CalendarCheck2, Clock3, Plus } from 'lucide-react'
import type { Task } from '@/types'
import { TaskCheckbox } from '@/components/tasks/TaskCheckbox'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import { CourseChip } from '@/components/tasks/CourseChip'
import { useTasks } from '@/context/TaskContext'
import { cn } from '@/lib/utils'

interface TodayFocusProps {
  tasks: Task[]
  onAddTask: () => void
}

const priorityRank = { high: 0, medium: 1, low: 2 } as const

function ProgressRing({ value }: { value: number }) {
  const size = 54
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative flex h-[54px] w-[54px] shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a48bff" />
            <stop offset="100%" stopColor="#6d4aff" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-[11px] font-extrabold tabular-nums">{Math.round(value)}%</span>
    </div>
  )
}

export function TodayFocus({ tasks, onAddTask }: TodayFocusProps) {
  const { toggleTask } = useTasks()

  const sorted = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1
    if (a.status !== 'done' && b.status === 'done') return -1
    const priority = priorityRank[a.priority] - priorityRank[b.priority]
    if (priority !== 0) return priority
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const completed = tasks.filter((task) => task.status === 'done').length
  const progress = tasks.length ? (completed / tasks.length) * 100 : 0

  return (
    <section className="card animate-rise overflow-hidden" style={{ animationDelay: '240ms' }}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold tracking-tight">Today&rsquo;s focus</h2>
            <span className="rounded-full border border-brand/15 bg-brand/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand uppercase">
              Today
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {format(new Date(), 'EEEE, MMMM d')} · {tasks.length === 0 ? 'No tasks' : `${completed}/${tasks.length} complete`}
          </p>
          {tasks.length > 0 && completed === tasks.length && (
            <p className="mt-1 text-xs font-semibold text-mint">All clear for today — nicely played.</p>
          )}
        </div>
        <ProgressRing value={progress} />
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint/10 text-mint">
            <CalendarCheck2 size={22} />
          </span>
          <p className="mt-3 text-sm font-bold">Nothing due today</p>
          <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-muted">
            A clear day — or the perfect chance to get ahead on something that matters.
          </p>
        </div>
      ) : (
        <div className="px-2.5 pb-1">
          {sorted.map((task) => {
            const done = task.status === 'done'
            return (
              <div
                key={task.id}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-2.5 py-3 transition-colors hover:bg-surface-2',
                  done && 'opacity-65',
                )}
              >
                <TaskCheckbox checked={done} onChange={() => toggleTask(task.id)} label={task.title} />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'truncate text-[13.5px] font-semibold transition-colors',
                      done && 'text-faint line-through',
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-faint">
                    <CourseChip courseId={task.courseId} />
                    <span className="h-0.5 w-0.5 rounded-full bg-faint" />
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={11} />
                      {format(parseISO(task.dueDate), 'h:mm a')}
                    </span>
                  </div>
                </div>
                <span className="hidden sm:block">
                  <PriorityBadge priority={task.priority} />
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <button
          onClick={onAddTask}
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-brand transition hover:bg-brand/10"
        >
          <Plus size={14} strokeWidth={2.6} /> Add task
        </button>
        <Link
          to="/tasks"
          className="focus-ring inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted transition hover:text-ink"
        >
          View all tasks <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  )
}
