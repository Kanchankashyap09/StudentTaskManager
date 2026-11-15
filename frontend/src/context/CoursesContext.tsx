import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import type { CourseSummary } from '@/types'

interface CoursesContextValue {
  courses: CourseSummary[]
  getCourse: (id: string) => CourseSummary | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

const CoursesContext = createContext<CoursesContextValue | null>(null)

export function CoursesProvider({ children }: { children: ReactNode }) {
  const coursesQuery = useQuery({
    queryKey: queryKeys.courses,
    queryFn: () => api.courses.list(),
  })

  const value = useMemo<CoursesContextValue>(() => {
    const courses = coursesQuery.data ?? []
    const byId = new Map(courses.map((course) => [course.id, course]))

    return {
      courses,
      getCourse: (id) => byId.get(id),
      isLoading: coursesQuery.isLoading,
      isError: coursesQuery.isError,
      error: (coursesQuery.error as Error | null) ?? null,
      refetch: () => {
        void coursesQuery.refetch()
      },
    }
  }, [coursesQuery.data, coursesQuery.isLoading, coursesQuery.isError, coursesQuery.error, coursesQuery.refetch])

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>
}

export function useCourses() {
  const context = useContext(CoursesContext)
  if (!context) throw new Error('useCourses must be used inside <CoursesProvider>')
  return context
}
