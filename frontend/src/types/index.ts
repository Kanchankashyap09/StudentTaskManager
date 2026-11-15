export type Priority = 'low' | 'medium' | 'high'

export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface Task {
  id: string
  title: string
  notes?: string | null
  courseId: string
  priority: Priority
  status: TaskStatus
  /** ISO date string */
  dueDate: string
  estimateMinutes: number
  /** ISO date string — set when the task is completed */
  completedAt?: string | null
  createdAt: string
}

export interface Course {
  id: string
  code: string
  name: string
  instructor: string
  /** Hex accent colour used for dots, chips and charts */
  color: string
  credits: number
  nextClass: string
}

/** Course payload returned by the Spring Boot API with aggregate task counts. */
export interface CourseSummary extends Course {
  totalTasks: number
  completedTasks: number
}

export type ScheduleEventType = 'class' | 'lab' | 'study'

export interface ScheduleEvent {
  id: string
  /** 0 = Monday … 6 = Sunday */
  day: number
  start: string
  end: string
  title: string
  courseId: string
  type: ScheduleEventType
}

export interface NewTaskInput {
  title: string
  courseId: string
  priority: Priority
  dueDate: string
  estimateMinutes: number
  notes?: string
}

export interface ActivityPoint {
  day: string
  tasks: number
  hours: number
}

export interface DashboardSummary {
  completedThisWeek: number
  activeTasks: number
  overdue: number
  dueToday: number
  streakDays: number
  totalCourses: number
  totalTasks: number
}

export interface StatCardData {
  label: string
  value: string
  hint: string
  trend: number
  icon: 'check' | 'active' | 'overdue' | 'streak'
  spark: number[]
  tone: 'brand' | 'mint' | 'amber' | 'rose'
}
