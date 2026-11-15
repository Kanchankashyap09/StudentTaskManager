import { useCourses } from '@/context/CoursesContext'
import { cn, withAlpha } from '@/lib/utils'

interface CourseChipProps {
  courseId: string
  showName?: boolean
  className?: string
}

export function CourseChip({ courseId, showName = false, className }: CourseChipProps) {
  const { getCourse } = useCourses()
  const course = getCourse(courseId)
  const color = course?.color ?? '#8b6cff'

  return (
    <span
      className={cn('inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted', className)}
      style={{ color: withAlpha(color, 0.95) }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="truncate">{showName ? (course?.name ?? 'General') : (course?.code ?? 'General')}</span>
    </span>
  )
}
