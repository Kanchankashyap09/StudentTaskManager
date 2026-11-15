import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, BookOpen, CalendarDays, GraduationCap, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCourses } from '@/context/CoursesContext'
import { useTasks } from '@/context/TaskContext'
import { withAlpha } from '@/lib/utils'

export function CoursesPage() {
  const { courses, isLoading, isError, error, refetch } = useCourses()
  const { tasks } = useTasks()
  const navigate = useNavigate()

  const rows = courses.map((course) => {
    const total = course.totalTasks
    const completed = course.completedTasks
    const progress = total ? (completed / total) * 100 : 0
    return { course, completed, total, progress }
  })

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
  const overall = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.progress, 0) / rows.length) : 0
  const totalCompleted = rows.reduce((sum, row) => sum + row.completed, 0)
  const totalTasks = rows.reduce((sum, row) => sum + row.total, 0)
  const nextDeadline = [...tasks]
    .filter((task) => task.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

  return (
    <>
      <div className="animate-rise flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-faint uppercase">Spring 2026</p>
          <h1 className="mt-1.5 text-[30px] leading-tight font-extrabold tracking-[-0.02em]">My courses</h1>
          <p className="mt-1.5 text-sm text-muted">
            {isLoading ? 'Loading your courses…' : `${courses.length} courses · ${totalCredits} credits · ${overall}% average completion`}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/calendar')}>
          <CalendarDays size={16} /> Weekly schedule
        </Button>
      </div>

      {isError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-rose/25 bg-rose/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-[13px] font-bold text-rose">Could not load your courses</p>
            <p className="mt-0.5 text-xs text-muted">{error?.message ?? 'The API request failed.'}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={refetch}>
            Try again
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="card animate-pulse space-y-4 p-5" style={{ animationDelay: `${index * 60}ms` }}>
                <div className="h-11 w-11 rounded-xl bg-surface-2" />
                <div className="h-4 w-3/4 rounded bg-surface-2" />
                <div className="h-3 w-1/2 rounded bg-surface-2" />
                <div className="h-1.5 rounded-full bg-surface-2" />
              </div>
            ))
          : rows.map(({ course, completed, total, progress }, index) => (
              <Link
                key={course.id}
                to={`/tasks?course=${course.id}`}
                className="card surface-hover animate-rise group relative flex flex-col overflow-hidden p-5"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div
                  className="pointer-events-none absolute -top-14 -right-14 h-36 w-36 rounded-full opacity-[0.13] blur-2xl transition-opacity duration-300 group-hover:opacity-25"
                  style={{ backgroundColor: course.color }}
                />

                <div className="relative flex items-start justify-between">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: withAlpha(course.color, 0.13), color: course.color }}
                  >
                    <BookOpen size={20} strokeWidth={2.2} />
                  </span>
                  <span
                    className="rounded-full border px-2 py-1 text-[9.5px] font-bold tracking-[0.08em] uppercase"
                    style={{
                      borderColor: withAlpha(course.color, 0.24),
                      backgroundColor: withAlpha(course.color, 0.08),
                      color: course.color,
                    }}
                  >
                    {course.code}
                  </span>
                </div>

                <h2 className="mt-4 text-[15px] leading-snug font-bold tracking-tight transition-colors group-hover:text-brand">
                  {course.name}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  {course.instructor} · {course.credits} credits
                </p>

                <div className="mt-5 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-muted">
                    {completed} of {total} tasks
                  </span>
                  <span className="font-extrabold tabular-nums">{Math.round(progress)}%</span>
                </div>
                <ProgressBar value={progress} color={course.color} className="mt-2" />

                <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                    <CalendarDays size={13} className="text-faint" />
                    {course.nextClass}
                  </span>
                  <ArrowUpRight
                    size={15}
                    className="text-faint transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
                  />
                </div>
              </Link>
            ))}

        {!isLoading && !isError && (
          <div
            className="animate-rise relative flex flex-col justify-between overflow-hidden rounded-[1.25rem] border border-brand/20 bg-gradient-to-br from-brand/20 via-surface to-surface p-5"
            style={{ animationDelay: '300ms' }}
          >
            <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-sky/10 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-brand uppercase">
                <Sparkles size={13} /> Semester pulse
              </span>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-[38px] leading-none font-extrabold tracking-tight tabular-nums">{overall}%</span>
                <span className="mb-1 text-xs font-semibold text-muted">average completion</span>
              </div>
              <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-muted">
                You&rsquo;ve finished {totalCompleted} of {totalTasks} course tasks. Keep the momentum steady — small
                sessions add up.
              </p>
            </div>

            <div className="relative mt-5">
              <div className="h-1.5 overflow-hidden rounded-full bg-brand/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b6cff] to-[#b7a2ff]"
                  style={{ width: `${overall}%` }}
                />
              </div>
              {nextDeadline && (
                <Link
                  to="/tasks"
                  className="focus-ring mt-4 flex items-center gap-2.5 rounded-xl border border-line/80 bg-surface/70 p-3 backdrop-blur transition hover:border-brand/30"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <GraduationCap size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[9.5px] font-bold tracking-wide text-faint uppercase">Next deadline</span>
                    <span className="mt-0.5 block truncate text-[11.5px] font-semibold">{nextDeadline.title}</span>
                  </span>
                  <ArrowUpRight size={14} className="shrink-0 text-faint" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-faint">
        Select a course to filter its tasks · Progress updates as you complete work
      </p>
    </>
  )
}
