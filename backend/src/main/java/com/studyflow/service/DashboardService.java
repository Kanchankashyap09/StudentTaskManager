package com.studyflow.service;

import com.studyflow.domain.Task;
import com.studyflow.domain.TaskStatus;
import com.studyflow.dto.DashboardSummary;
import com.studyflow.repository.CourseRepository;
import com.studyflow.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final TaskRepository taskRepository;
    private final CourseRepository courseRepository;

    public DashboardService(TaskRepository taskRepository, CourseRepository courseRepository) {
        this.taskRepository = taskRepository;
        this.courseRepository = courseRepository;
    }

    public DashboardSummary summary() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        Instant todayStart = today.atStartOfDay(zone).toInstant();
        Instant tomorrowStart = today.plusDays(1).atStartOfDay(zone).toInstant();
        Instant weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .atStartOfDay(zone)
                .toInstant();

        List<Task> tasks = taskRepository.findAll();

        int completedThisWeek = (int) tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE && task.getCompletedAt() != null)
                .filter(task -> !task.getCompletedAt().isBefore(weekStart))
                .count();

        int activeTasks = (int) tasks.stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .count();

        int overdue = (int) tasks.stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .filter(task -> task.getDueDate().isBefore(todayStart))
                .count();

        int dueToday = (int) tasks.stream()
                .filter(task -> task.getStatus() != TaskStatus.DONE)
                .filter(task -> !task.getDueDate().isBefore(todayStart) && task.getDueDate().isBefore(tomorrowStart))
                .count();

        Set<LocalDate> completedDays = new HashSet<>();
        for (Task task : tasks) {
            if (task.getStatus() == TaskStatus.DONE && task.getCompletedAt() != null) {
                completedDays.add(task.getCompletedAt().atZone(zone).toLocalDate());
            }
        }

        int streakDays = 0;
        LocalDate cursor = today;
        if (!completedDays.contains(cursor)) {
            cursor = cursor.minusDays(1);
        }
        while (completedDays.contains(cursor)) {
            streakDays++;
            cursor = cursor.minusDays(1);
        }

        return new DashboardSummary(
                completedThisWeek,
                activeTasks,
                overdue,
                dueToday,
                streakDays,
                (int) courseRepository.count(),
                tasks.size()
        );
    }
}
