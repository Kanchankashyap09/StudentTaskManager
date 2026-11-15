import { useEffect, useRef, useState, type FormEvent } from 'react'
import { BookOpen, CalendarDays, Flag, Loader2, Timer } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCourses } from '@/context/CoursesContext'
import { useTasks } from '@/context/TaskContext'
import { toDateInputValue } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { Priority } from '@/types'

interface TaskModalProps {
  open: boolean
  onClose: () => void
}

const fieldClass =
  'w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-brand/60 focus:ring-4 focus:ring-brand/10'

const labelClass = 'mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-muted uppercase'

const priorities: { value: Priority; label: string; active: string }[] = [
  { value: 'low', label: 'Low', active: 'border-sky/50 bg-sky/10 text-sky' },
  { value: 'medium', label: 'Medium', active: 'border-amber/50 bg-amber/10 text-amber' },
  { value: 'high', label: 'High', active: 'border-rose/50 bg-rose/10 text-rose' },
]

export function TaskModal({ open, onClose }: TaskModalProps) {
  const { addTask } = useTasks()
  const { courses, isLoading: coursesLoading, isError: coursesError } = useCourses()
  const titleRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState(toDateInputValue(new Date()))
  const [estimate, setEstimate] = useState('60')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle('')
    setPriority('medium')
    setDueDate(toDateInputValue(new Date()))
    setEstimate('60')
    setNotes('')
    setError('')
    setSubmitError('')
    setSubmitting(false)
    const timer = window.setTimeout(() => titleRef.current?.focus(), 60)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (open && !courseId && courses.length > 0) {
      setCourseId(courses[0].id)
    }
  }, [open, courseId, courses])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return

    const trimmed = title.trim()
    if (!trimmed) {
      setError('Give your task a title first.')
      titleRef.current?.focus()
      return
    }
    if (!courseId) {
      setSubmitError('Choose a course before creating the task.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      await addTask({
        title: trimmed,
        courseId,
        priority,
        dueDate: new Date(`${dueDate}T23:59:00`).toISOString(),
        estimateMinutes: Number(estimate),
        notes: notes.trim() || undefined,
      })
      onClose()
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : 'Could not create the task. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a new task"
      description="Capture it now — you can always refine the details later."
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label htmlFor="task-title" className={labelClass}>
              <Flag size={12} /> Task title
            </label>
            <input
              ref={titleRef}
              id="task-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. Finish the graph algorithms problem set"
              className={cn(fieldClass, error && 'border-rose/60 ring-4 ring-rose/10')}
            />
            {error && <p className="mt-1.5 text-xs font-medium text-rose">{error}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-course" className={labelClass}>
                <BookOpen size={12} /> Course
              </label>
              <select
                id="task-course"
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                disabled={coursesLoading || courses.length === 0}
                className={cn(fieldClass, 'cursor-pointer disabled:cursor-wait')}
              >
                {courses.length === 0 && <option value="">{coursesLoading ? 'Loading courses…' : 'No courses'}</option>}
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} — {course.name}
                  </option>
                ))}
              </select>
              {coursesError && (
                <p className="mt-1.5 text-xs font-medium text-rose">Courses could not be loaded. Check the API and try again.</p>
              )}
            </div>
            <div>
              <label htmlFor="task-due" className={labelClass}>
                <CalendarDays size={12} /> Due date
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                min="2020-01-01"
                onChange={(event) => setDueDate(event.target.value)}
                className={cn(fieldClass, 'cursor-pointer')}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={labelClass}>
                <Flag size={12} /> Priority
              </span>
              <div className="grid grid-cols-3 gap-2">
                {priorities.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={cn(
                      'focus-ring rounded-xl border px-2 py-2 text-xs font-semibold transition',
                      priority === option.value
                        ? option.active
                        : 'border-line bg-surface-2 text-muted hover:border-line hover:text-ink',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="task-estimate" className={labelClass}>
                <Timer size={12} /> Estimate
              </label>
              <select
                id="task-estimate"
                value={estimate}
                onChange={(event) => setEstimate(event.target.value)}
                className={cn(fieldClass, 'cursor-pointer')}
              >
                {[15, 30, 45, 60, 90, 120, 180].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes < 60 ? `${minutes} minutes` : `${minutes / 60} hour${minutes > 60 ? 's' : ''}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="task-notes" className={labelClass}>
              Notes <span className="font-medium normal-case tracking-normal text-faint">(optional)</span>
            </label>
            <textarea
              id="task-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Add a checklist, a reminder, or where you left off…"
              className={cn(fieldClass, 'resize-none')}
            />
          </div>

          {submitError && (
            <div role="alert" className="rounded-xl border border-rose/25 bg-rose/[0.07] px-3.5 py-2.5 text-xs font-medium text-rose">
              {submitError}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line bg-surface-2/60 px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || coursesLoading || !courseId}>
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {submitting ? 'Creating…' : 'Create task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
