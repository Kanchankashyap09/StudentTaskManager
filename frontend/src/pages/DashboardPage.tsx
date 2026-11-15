import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { isToday, parseISO, startOfWeek } from 'date-fns'
import { CalendarDays, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { TodayFocus } from '@/components/dashboard/TodayFocus'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { CourseProgressCard } from '@/components/dashboard/CourseProgressCard'
import { TaskModal } from '@/components/tasks/TaskModal'
import { useTasks } from '@/context/TaskContext'
import { api } from '@/lib/api'
import { isOverdue } from '@/lib/date'
import { buildDashboardInsights } from '@/lib/insights'
import { queryKeys } from '@/lib/queryKeys'
import type { StatCardData } from '@/types'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card h-[164px]" />
        ))}
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-3">
        <div className="flex flex-col gap-5 xl:col-span-2">
          <div className="card h-[340px]" />
          <div className="card h-[360px]" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="card h-[320px]" />
          <div className="card h-[340px]" />
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { tasks, isLoading: tasksLoading, isError: tasksError, error: tasksErrorValue, refetch: refetchTasks } = useTasks()
  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.dashboard.summary(),
  })
  const navigate = useNavigate()
  const [taskModalOpen, setTaskModalOpen] = useState(false)

  const insights = useMemo(() => buildDashboardInsights(tasks), [tasks])
  const summary = summaryQuery.data
  const isLoading = tasksLoading || summaryQuery.isLoading

  const metrics = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const todayTasks = tasks.filter((task) => isToday(parseISO(task.dueDate)))
    const active =
      summary?.activeTasks ?? tasks.filter((task) => task.status !== 'done').length
    const overdue =
      summary?.overdue ?? tasks.filter((task) => task.status !== 'done' && isOverdue(task.dueDate)).length
    const completedThisWeek =
      summary?.completedThisWeek ??
      tasks.filter((task) => task.status === 'done' && task.completedAt && parseISO(task.completedAt) >= weekStart).length
    const dueToday = summary?.dueToday ?? todayTasks.filter((task) => task.status !== 'done').length
    const streakDays = summary?.streakDays ?? 0

    const stats: StatCardData[] = [
      {
        label: 'Tasks completed',
        value: String(completedThisWeek),
        hint: 'this week',
        trend: insights.completedTrend,
        icon: 'check',
        spark: insights.sparks.completed,
        tone: 'brand',
      },
      {
        label: 'Active tasks',
        value: String(active),
        hint: 'in your queue',
        trend: insights.activeTrend,
        icon: 'active',
        spark: insights.sparks.active,
        tone: 'mint',
      },
      {
        label: 'Overdue',
        value: String(overdue),
        hint: 'need attention',
        trend: insights.overdueTrend,
        icon: 'overdue',
        spark: insights.sparks.overdue,
        tone: 'rose',
      },
      {
        label: 'Study streak',
        value: `${streakDays} ${streakDays === 1 ? 'day' : 'days'}`,
        hint: 'current streak',
        trend: 0,
        icon: 'streak',
        spark: insights.sparks.streak,
        tone: 'amber',
      },
    ]

    return { todayTasks, dueToday, overdue, stats }
  }, [tasks, summary, insights])

  const subtitle = useMemo(() => {
    if (isLoading) return 'Loading your day…'
    const parts = [
      `${metrics.dueToday} ${metrics.dueToday === 1 ? 'task' : 'tasks'} due today`,
      metrics.overdue > 0 ? `${metrics.overdue} overdue` : null,
    ].filter(Boolean)

    return `${parts.join(' · ')}. ${metrics.overdue > 0 ? "Let's get back on track." : 'Make today count.'}`
  }, [metrics, isLoading])

  const hasError = tasksError || summaryQuery.isError
  const errorMessage =
    tasksErrorValue?.message ??
    (summaryQuery.error instanceof Error ? summaryQuery.error.message : 'The API request failed.')

  function retry() {
    refetchTasks()
    void summaryQuery.refetch()
  }

  return (
    <>
      <div className="animate-rise flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/15 bg-brand/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-brand uppercase">
            <Sparkles size={12} /> Your daily overview
          </span>
          <h1 className="mt-3 text-[30px] leading-tight font-extrabold tracking-[-0.02em] sm:text-[34px]">
            {greeting()}, Alex
            <span className="ml-1.5 inline-block origin-bottom-right animate-[wave_1.6s_ease-in-out_1]">👋</span>
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted">{subtitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button variant="secondary" onClick={() => navigate('/calendar')}>
            <CalendarDays size={16} /> Agenda
          </Button>
          <Button onClick={() => setTaskModalOpen(true)}>
            <Plus size={17} strokeWidth={2.6} /> New task
          </Button>
        </div>
      </div>

      {hasError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-rose/25 bg-rose/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-[13px] font-bold text-rose">Could not load your dashboard</p>
            <p className="mt-0.5 text-xs text-muted">{errorMessage}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <StatsCards stats={metrics.stats} />

          <div className="grid items-start gap-5 xl:grid-cols-3">
            <div className="flex flex-col gap-5 xl:col-span-2">
              <TodayFocus tasks={metrics.todayTasks} onAddTask={() => setTaskModalOpen(true)} />
              <ActivityChart data={insights.activity} trends={{ tasks: insights.completedTrend, hours: insights.hoursTrend }} />
            </div>
            <div className="flex flex-col gap-5">
              <UpcomingDeadlines tasks={tasks} />
              <CourseProgressCard />
            </div>
          </div>
        </>
      )}

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </>
  )
}
