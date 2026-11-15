import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, CheckCheck, Menu, Moon, Search, Sun } from 'lucide-react'
import { format } from 'date-fns'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

interface TopbarProps {
  onMenuClick: () => void
}

interface NotificationItem {
  id: string
  title: string
  body: string
  time: string
  tone: 'brand' | 'mint' | 'amber' | 'rose'
  read: boolean
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Graph algorithms due tonight',
    body: 'The CS 301 problem set closes at 11:59 PM.',
    time: '2h ago',
    tone: 'rose',
    read: false,
  },
  {
    id: 'n2',
    title: 'Assignment graded',
    body: 'Dr. Chen left feedback on your AVL tree submission.',
    time: 'Yesterday',
    tone: 'mint',
    read: false,
  },
  {
    id: 'n3',
    title: 'New course material',
    body: 'Week 7 slides are up in Introduction to ML.',
    time: '2d ago',
    tone: 'brand',
    read: true,
  },
]

const toneClasses = {
  brand: 'bg-brand',
  mint: 'bg-mint',
  amber: 'bg-amber',
  rose: 'bg-rose',
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const unread = notifications.filter((item) => !item.read).length

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/tasks?q=${encodeURIComponent(trimmed)}` : '/tasks')
    searchRef.current?.blur()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-app/80 backdrop-blur-xl">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenuClick}
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:text-ink lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <form onSubmit={handleSearch} className="relative hidden w-full max-w-sm sm:block">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks, courses…"
            aria-label="Search tasks and courses"
            className="focus-ring h-10 w-full rounded-xl border border-line bg-surface pr-14 pl-10 text-sm text-ink transition placeholder:text-faint focus:border-brand/50"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-faint">
            ⌘K
          </kbd>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-muted md:flex">
            <CalendarDays size={14} className="text-brand" />
            {format(new Date(), 'EEE, MMM d')}
          </div>

          <button
            onClick={toggleTheme}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:border-brand/30 hover:text-ink"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((value) => !value)}
              className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:border-brand/30 hover:text-ink"
              aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
              aria-expanded={notificationsOpen}
            >
              <Bell size={17} />
              {unread > 0 && (
                <span className="absolute top-2 right-2.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose ring-2 ring-surface" />
                </span>
              )}
            </button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} aria-hidden="true" />
                <div className="animate-pop absolute right-0 z-50 mt-2 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-pop)]">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">Notifications</p>
                      {unread > 0 && (
                        <span className="rounded-full bg-brand/12 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                          {unread} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((current) => current.map((item) => ({ ...item, read: true })))
                      }
                      className="focus-ring flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-muted transition hover:text-brand"
                    >
                      <CheckCheck size={13} /> Mark all read
                    </button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          setNotifications((current) =>
                            current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)),
                          )
                        }
                        className={cn(
                          'flex w-full gap-3 border-b border-line px-4 py-3 text-left transition last:border-0 hover:bg-surface-2',
                          !item.read && 'bg-brand/[0.035]',
                        )}
                      >
                        <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', toneClasses[item.tone])} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[13px] font-bold">{item.title}</span>
                            <span className="shrink-0 text-[10px] text-faint">{item.time}</span>
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted">{item.body}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-line bg-surface-2 px-4 py-2.5 text-center">
                    <span className="text-[11px] font-semibold text-faint">You&rsquo;re all caught up with reminders</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="ml-1 flex items-center gap-2.5 border-l border-line pl-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f5a97f] to-[#f472b6] text-[11px] font-extrabold text-white">
              AK
            </span>
            <div className="hidden leading-tight xl:block">
              <p className="text-[13px] font-bold">Alex Kim</p>
              <p className="text-[11px] text-faint">Student</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
