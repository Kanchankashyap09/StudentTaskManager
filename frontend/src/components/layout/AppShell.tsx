import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, WifiOff } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'My Tasks',
  '/calendar': 'Calendar',
  '/courses': 'Courses',
}

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading page">
      <div className="h-9 w-64 rounded-xl bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card h-[164px]" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="card h-[420px] xl:col-span-2" />
        <div className="card h-[420px]" />
      </div>
    </div>
  )
}

function ApiStatusBanner() {
  const queryClient = useQueryClient()
  const [retrying, setRetrying] = useState(false)

  const healthQuery = useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.health(),
    retry: 1,
    staleTime: 30_000,
  })

  if (!healthQuery.isError) return null

  async function retry() {
    setRetrying(true)
    try {
      await queryClient.invalidateQueries()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div
      role="alert"
      className="animate-rise flex flex-col gap-3 rounded-2xl border border-amber/30 bg-amber/[0.08] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber/15 text-amber">
          <WifiOff size={16} />
        </span>
        <div>
          <p className="text-[13px] font-bold">Can&rsquo;t reach the StudyFlow API</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Start the Spring Boot backend on port 8080, then retry. Showing whatever data is already loaded.
          </p>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={retry} disabled={retrying}>
        <RefreshCw size={14} className={cn(retrying && 'animate-spin')} />
        {retrying ? 'Retrying…' : 'Retry connection'}
      </Button>
    </div>
  )
}

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const title = pageTitles[location.pathname]
    document.title = title ? `${title} · StudyFlow` : 'StudyFlow · Student Task Manager'
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-[264px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-4 pt-6 pb-10 sm:px-6 lg:px-8">
          <ApiStatusBanner />
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>

        <footer className="border-t border-line px-6 py-5 text-center text-[11px] text-faint">
          StudyFlow · Built for focused students · Spring 2026
        </footer>
      </div>
    </div>
  )
}
