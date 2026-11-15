import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { parseISO, startOfWeek } from 'date-fns'
import { useTasks } from '@/context/TaskContext'
import { cn } from '@/lib/utils'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'My Tasks', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/courses', label: 'Courses', icon: BookOpen },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const { tasks } = useTasks()
  const location = useLocation()
  const activeCount = tasks.filter((task) => task.status !== 'done').length
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const completedCount = tasks.filter(
    (task) => task.status === 'done' && task.completedAt && parseISO(task.completedAt) >= weekStart,
  ).length
  const weeklyGoal = 18
  const goalProgress = Math.min(Math.round((completedCount / weeklyGoal) * 100), 100)

  useEffect(() => {
    onClose()
    // Only react to route changes, not to callback identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-[#05070d]/60 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-line bg-surface transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <NavLink to="/" className="focus-ring flex items-center gap-3 rounded-xl" aria-label="StudyFlow home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#9c80ff] to-[#5b3df5] text-white shadow-[0_10px_24px_-8px_rgba(109,74,255,0.7)]">
              <GraduationCap size={21} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-[17px] leading-tight font-extrabold tracking-tight">StudyFlow</span>
              <span className="block text-[10px] font-semibold tracking-[0.16em] text-faint uppercase">
                Spring &rsquo;26
              </span>
            </span>
          </NavLink>
          <button
            onClick={onClose}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3.5">
          <p className="mb-2 px-2.5 text-[10px] font-bold tracking-[0.14em] text-faint uppercase">Workspace</p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'focus-ring group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                    isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface-2 hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      strokeWidth={isActive ? 2.4 : 2}
                      className={cn(
                        'shrink-0 transition-colors',
                        isActive ? 'text-brand' : 'text-faint group-hover:text-ink',
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.to === '/tasks' && activeCount > 0 && (
                      <span
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                          isActive ? 'bg-brand/15 text-brand' : 'bg-surface-3 text-muted',
                        )}
                      >
                        {activeCount}
                      </span>
                    )}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="px-3.5 pb-4">
          <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-brand-soft p-4">
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-brand/20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-brand uppercase">
                  <Sparkles size={13} /> Weekly goal
                </span>
                <span className="text-[11px] font-bold text-brand tabular-nums">{goalProgress}%</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink">
                {completedCount} of {weeklyGoal} tasks done
              </p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-brand/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b6cff] to-[#b7a2ff] transition-[width] duration-500"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] leading-snug text-muted">
                {goalProgress < 100
                  ? `${Math.max(weeklyGoal - completedCount, 0)} to go — you've got this.`
                  : 'Weekly goal smashed. Take a breather!'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl px-1.5 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5a97f] to-[#f472b6] text-[11px] font-extrabold text-white ring-2 ring-surface-2">
              AK
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold">Alex Kim</p>
              <p className="truncate text-[11px] text-faint">B.Sc. Computer Science</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-mint shadow-[0_0_0_3px_color-mix(in_srgb,var(--mint)_15%,transparent)]" />
          </div>
        </div>
      </aside>
    </>
  )
}
