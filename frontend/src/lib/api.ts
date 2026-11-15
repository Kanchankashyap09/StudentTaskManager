import type { CourseSummary, DashboardSummary, NewTaskInput, ScheduleEvent, Task } from '@/types'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new ApiError(body?.message ?? `Request failed with status ${response.status}`, response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  health() {
    return request<{ status: string; service: string }>('/health')
  },
  tasks: {
    list(params: { status?: string; courseId?: string; priority?: string; q?: string } = {}) {
      const search = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) search.set(key, value)
      })
      const suffix = search.size ? `?${search.toString()}` : ''
      return request<Task[]>(`/tasks${suffix}`)
    },
    create(input: NewTaskInput) {
      return request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) })
    },
    update(id: string, patch: Record<string, unknown>) {
      return request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    },
    toggle(id: string) {
      return request<Task>(`/tasks/${id}/toggle`, { method: 'PATCH' })
    },
    remove(id: string) {
      return request<void>(`/tasks/${id}`, { method: 'DELETE' })
    },
  },
  courses: {
    list() {
      return request<CourseSummary[]>('/courses')
    },
  },
  schedule: {
    list() {
      return request<ScheduleEvent[]>('/schedule')
    },
  },
  dashboard: {
    summary() {
      return request<DashboardSummary>('/dashboard/summary')
    },
  },
}
