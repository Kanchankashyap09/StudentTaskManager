import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import type { NewTaskInput, Task } from '@/types'

interface TaskContextValue {
  tasks: Task[]
  addTask: (input: NewTaskInput) => Promise<Task>
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

const TaskContext = createContext<TaskContextValue | null>(null)

export function TaskProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => api.tasks.list(),
  })

  const invalidateDerivedData = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
    void queryClient.invalidateQueries({ queryKey: queryKeys.courses })
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
  }

  const addMutation = useMutation({
    mutationFn: (input: NewTaskInput) => api.tasks.create(input),
    onSuccess: (task) => {
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (current) => [task, ...(current ?? [])])
      invalidateDerivedData()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.tasks.toggle(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks })
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks)

      queryClient.setQueryData<Task[]>(queryKeys.tasks, (current) =>
        current?.map((task) => {
          if (task.id !== id) return task
          const isDone = task.status === 'done'
          return {
            ...task,
            status: isDone ? 'todo' : 'done',
            completedAt: isDone ? null : new Date().toISOString(),
          } satisfies Task
        }),
      )

      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks, context.previous)
      }
    },
    onSettled: invalidateDerivedData,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.tasks.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks })
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks)
      queryClient.setQueryData<Task[]>(queryKeys.tasks, (current) => current?.filter((task) => task.id !== id))
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks, context.previous)
      }
    },
    onSettled: invalidateDerivedData,
  })

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks: tasksQuery.data ?? [],
      addTask: (input) => addMutation.mutateAsync(input),
      toggleTask: (id) => toggleMutation.mutate(id),
      deleteTask: (id) => deleteMutation.mutate(id),
      isLoading: tasksQuery.isLoading,
      isError: tasksQuery.isError,
      error: (tasksQuery.error as Error | null) ?? null,
      refetch: () => {
        void tasksQuery.refetch()
      },
    }),
    // Mutation objects are stable enough for this app; refresh when query state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasksQuery.data, tasksQuery.isLoading, tasksQuery.isError, tasksQuery.error, tasksQuery.refetch, addMutation, toggleMutation, deleteMutation],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTasks must be used inside <TaskProvider>')
  return context
}
