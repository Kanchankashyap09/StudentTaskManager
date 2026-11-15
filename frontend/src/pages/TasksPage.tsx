import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ArrowUpDown, CalendarClock, Inbox, Plus, Search, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TaskCheckbox } from '@/components/tasks/TaskCheckbox'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import { CourseChip } from '@/components/tasks/CourseChip'
import { TaskModal } from '@/components/tasks/TaskModal'
import { useCourses } from '@/context/CoursesContext'
import { useTasks } from '@/context/TaskContext'
import { formatDueDate, isOverdue } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { Priority, TaskStatus } from '@/types'

type StatusFilter = 'all' | TaskStatus
type PriorityFilter = 'all' | Priority

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Completed' },
]

export function TasksPage() {
  const { tasks, toggleTask, deleteTask, isLoading, isError, error, refetch } = useTasks()
  const { courses, getCourse } = useCourses()
  const [searchParams, setSearchParams] = useSearchParams()
  const [status, setStatus] = useState<StatusFilter>('all')
  const [priority, setPriority] = useState<PriorityFilter>('all')
  const [taskModalOpen, setTaskModalOpen] = useState(false)

  const query = searchParams.get('q') ?? ''
  const courseFilter = searchParams.get('course') ?? 'all'
  const activeCourse = courseFilter !== 'all' ? getCourse(courseFilter) : undefined

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((task) => task.status === 'todo').length,
      'in-progress': tasks.filter((task) => task.status === 'in-progress').length,
      done: tasks.filter((task) => task.status === 'done').length,
    } satisfies Record<StatusFilter, number>
  }, [tasks])

  const visible = useMemo(() => {
    const lowered = query.trim().toLowerCase()

    return tasks
      .filter((task) => {
        if (status !== 'all' && task.status !== status) return false
        if (priority !== 'all' && task.priority !== priority) return false
        if (courseFilter !== 'all' && task.courseId !== courseFilter) return false
        if (!lowered) return true

        const course = getCourse(task.courseId)
        return [task.title, task.notes ?? '', course?.code ?? '', course?.name ?? '']
          .join(' ')
          .toLowerCase()
          .includes(lowered)
      })
      .sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1
        if (a.status !== 'done' && b.status === 'done') return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
  }, [tasks, status, priority, courseFilter, query, getCourse])

  const overdue = tasks.filter((task) => task.status !== 'done' && isOverdue(task.dueDate)).length
  const hasFilters = query !== '' || status !== 'all' || priority !== 'all' || courseFilter !== 'all'

  function resetFilters() {
    setStatus('all')
    setPriority('all')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  return (
    <>
      <div className="animate-rise flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-faint uppercase">Workspace</p>
          <h1 className="mt-1.5 text-[30px] leading-tight font-extrabold tracking-[-0.02em]">My tasks</h1>
          <p className="mt-1.5 text-sm text-muted">
            {counts.todo + counts['in-progress']} active · {overdue} overdue · {counts.done} completed
          </p>
        </div>
        <Button onClick={() => setTaskModalOpen(true)}>
          <Plus size={17} strokeWidth={2.6} /> Add task
        </Button>
      </div>

      {isError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-rose/25 bg-rose/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-[13px] font-bold text-rose">Could not load your tasks</p>
            <p className="mt-0.5 text-xs text-muted">{error?.message ?? 'The API request failed.'}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={refetch}>
            Try again
          </Button>
        </div>
      )}

      <section className="card animate-rise p-4" style={{ animationDelay: '80ms' }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(event) => updateParam('q', event.target.value)}
              placeholder="Search by title, note or course…"
              aria-label="Search tasks"
              className="focus-ring h-10 w-full rounded-xl border border-line bg-surface-2 pr-9 pl-10 text-sm text-ink transition placeholder:text-faint focus:border-brand/50"
            />
            {query && (
              <button
                onClick={() => updateParam('q', '')}
                className="focus-ring absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-faint hover:bg-surface-3 hover:text-ink"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap rounded-xl border border-line bg-surface-2 p-1" role="tablist" aria-label="Filter by status">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  role="tab"
                  aria-selected={status === tab.value}
                  onClick={() => setStatus(tab.value)}
                  className={cn(
                    'focus-ring flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold transition-all',
                    status === tab.value
                      ? 'bg-surface text-ink shadow-sm'
                      : 'text-muted hover:text-ink',
                  )}
                >
                  {tab.label}
                  <span className={cn('text-[10px] tabular-nums', status === tab.value ? 'text-brand' : 'text-faint')}>
                    {counts[tab.value]}
                  </span>
                </button>
              ))}
            </div>

            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as PriorityFilter)}
              aria-label="Filter by priority"
              className="focus-ring h-10 cursor-pointer rounded-xl border border-line bg-surface-2 px-3 text-xs font-semibold text-ink"
            >
              <option value="all">All priorities</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>

            <select
              value={courseFilter}
              onChange={(event) => updateParam('course', event.target.value)}
              aria-label="Filter by course"
              className="focus-ring h-10 max-w-[190px] cursor-pointer rounded-xl border border-line bg-surface-2 px-3 text-xs font-semibold text-ink"
            >
              <option value="all">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(activeCourse || hasFilters) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <span className="text-[11px] text-faint">Showing {visible.length} of {tasks.length}</span>
            {activeCourse && (
              <span
                className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold"
                style={{
                  borderColor: `${activeCourse.color}44`,
                  backgroundColor: `${activeCourse.color}14`,
                  color: activeCourse.color,
                }}
              >
                {activeCourse.code}
                <button
                  onClick={() => updateParam('course', 'all')}
                  aria-label="Clear course filter"
                  className="rounded-sm hover:opacity-70"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {hasFilters && (
              <button onClick={resetFilters} className="text-[11px] font-semibold text-brand hover:underline">
                Reset filters
              </button>
            )}
          </div>
        )}
      </section>

      <section className="card animate-rise overflow-hidden" style={{ animationDelay: '140ms' }}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
          <p className="text-xs font-bold text-muted">
            {visible.length} {visible.length === 1 ? 'task' : 'tasks'}
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
            <ArrowUpDown size={12} /> Due date
          </span>
        </div>

        {isLoading ? (
          <div className="divide-y divide-line" aria-label="Loading tasks">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex animate-pulse items-start gap-3 px-4 py-4 sm:px-5">
                <div className="h-5 w-5 rounded-md bg-surface-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 rounded bg-surface-2" />
                  <div className="h-2.5 w-1/3 rounded bg-surface-2" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Inbox size={24} />
            </span>
            <p className="mt-4 text-sm font-bold">No tasks match those filters</p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">
              Try a different search, or clear the filters to see everything on your list.
            </p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div>
            {visible.map((task) => {
              const done = task.status === 'done'
              const late = !done && isOverdue(task.dueDate)
              return (
                <div
                  key={task.id}
                  className={cn(
                    'group flex items-start gap-3 border-b border-line px-4 py-3.5 transition-colors last:border-0 hover:bg-surface-2/70 sm:px-5',
                    done && 'opacity-65',
                  )}
                >
                  <div className="pt-0.5">
                    <TaskCheckbox checked={done} onChange={() => toggleTask(task.id)} label={task.title} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <p className={cn('text-[13.5px] leading-snug font-semibold', done && 'text-faint line-through')}>
                        {task.title}
                      </p>
                      <span className="hidden sm:block">
                        <PriorityBadge priority={task.priority} />
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-faint">
                      <CourseChip courseId={task.courseId} />
                      <span className="h-0.5 w-0.5 rounded-full bg-faint" />
                      <span className={cn('inline-flex items-center gap-1', late && 'font-semibold text-rose')}>
                        <CalendarClock size={11} />
                        {formatDueDate(task.dueDate)}
                      </span>
                      <span className="hidden h-0.5 w-0.5 rounded-full bg-faint md:inline-block" />
                      <span className="hidden md:inline">{task.estimateMinutes} min</span>
                      {task.status === 'in-progress' && (
                        <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[9.5px] font-bold text-brand">
                          In progress
                        </span>
                      )}
                      {late && (
                        <span className="rounded-full bg-rose/10 px-1.5 py-0.5 text-[9.5px] font-bold text-rose">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 pt-0.5">
                    <span className="hidden text-[10px] text-faint tabular-nums md:block">
                      {format(parseISO(task.dueDate), 'MMM d')}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Delete "${task.title}"`}
                      className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-faint opacity-100 transition hover:bg-rose/10 hover:text-rose sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <p className="text-center text-[11px] text-faint">
        Need a different view?{' '}
        <Link to="/calendar" className="font-semibold text-brand hover:underline">
          See your class schedule
        </Link>
      </p>

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </>
  )
}
