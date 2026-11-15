package com.studyflow.dto;

public record DashboardSummary(
        int completedThisWeek,
        int activeTasks,
        int overdue,
        int dueToday,
        int streakDays,
        int totalCourses,
        int totalTasks
) {
}
