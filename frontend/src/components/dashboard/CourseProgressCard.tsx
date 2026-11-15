import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCourses } from '@/context/CoursesContext'

export function CourseProgressCard() {
  const { courses, isLoading } = useCourses()

  const rows = courses.map((course) => {
    const total = course.totalTasks
    const completed = course.completedTasks
    const progress = total ? (completed / total) * 100 : 0
    return { course, completed, total, progress }
  })

  const overall = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.progress, 0) / rows.length)
    : 0

  return (
    <section className="card animate-rise overflow-hidden" style={{ animationDelay: '420ms' }}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <h2 className="text-[17px] font-bold tracking-tight">Course progress</h2>
          <p className="mt-1 text-xs text-muted">Where each class stands this term.</p>
        </div>
        <span className="rounded-full border border-line bg-surface-2 px-2 py-1 text-[10px] font-bold text-muted tabular-nums">
          {isLoading ? '—' : `${overall}% avg`}
        </span>
      </div>

      <div className="space-y-3.5 px-5 pb-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse space-y-2">
                <div className="h-3 w-2/3 rounded bg-surface-2" />
                <div className="h-1.5 rounded-full bg-surface-2" />
              </div>
            ))
          : rows.map(({ course, completed, total, progress }) => (
              <Link
                key={course.id}
                to={`/tasks?course=${course.id}`}
                className="focus-ring group block rounded-lg"
                aria-label={`View ${course.name} tasks`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full ring-[3px] ring-surface-2"
                      style={{ backgroundColor: course.color }}
                    />
                    <span className="truncate text-[12.5px] font-semibold transition-colors group-hover:text-brand">
                      {course.code}
                    </span>
                    <span className="hidden truncate text-[11px] text-faint sm:inline">· {course.name}</span>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold tabular-nums">{Math.round(progress)}%</span>
                </div>
                <div className="mt-2 flex items-center gap-2.5">
                  <ProgressBar value={progress} color={course.color} height={5} className="flex-1" />
                  <span className="w-9 shrink-0 text-right text-[10px] text-faint tabular-nums">
                    {completed}/{total}
                  </span>
                </div>
              </Link>
            ))}
      </div>

      <div className="border-t border-line px-5 py-3">
        <Link
          to="/courses"
          className="focus-ring inline-flex items-center gap-1 rounded-md text-xs font-bold text-brand transition hover:gap-1.5"
        >
          View all courses <ArrowUpRight size={13} />
        </Link>
      </div>
    </section>
  )
}
