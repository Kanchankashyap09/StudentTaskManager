package com.studyflow.config;

import com.studyflow.domain.Course;
import com.studyflow.domain.Priority;
import com.studyflow.domain.ScheduleEvent;
import com.studyflow.domain.Task;
import com.studyflow.domain.TaskStatus;
import com.studyflow.repository.CourseRepository;
import com.studyflow.repository.ScheduleEventRepository;
import com.studyflow.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;

/**
 * Seeds a realistic single-student workspace on first boot so the dashboard
 * has something meaningful to show before the user creates any data.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final TaskRepository taskRepository;
    private final ScheduleEventRepository scheduleEventRepository;
    private final ZoneId zone = ZoneId.systemDefault();

    public DataSeeder(
            CourseRepository courseRepository,
            TaskRepository taskRepository,
            ScheduleEventRepository scheduleEventRepository
    ) {
        this.courseRepository = courseRepository;
        this.taskRepository = taskRepository;
        this.scheduleEventRepository = scheduleEventRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (courseRepository.count() > 0) {
            return;
        }

        Course cs301 = courseRepository.save(new Course(
                "cs301", "CS 301", "Advanced Data Structures", "Dr. Maya Chen", "#8b6cff", 4, "Mon · 10:00 AM"));
        Course cs320 = courseRepository.save(new Course(
                "cs320", "CS 320", "Operating Systems", "Dr. Priya Nair", "#fbbf24", 4, "Tue · 1:00 PM"));
        Course math204 = courseRepository.save(new Course(
                "math204", "MATH 204", "Linear Algebra", "Prof. Daniel Ross", "#34d399", 3, "Tue · 9:00 AM"));
        Course eng210 = courseRepository.save(new Course(
                "eng210", "ENG 210", "Technical Writing", "Sarah Kim", "#38bdf8", 3, "Wed · 11:00 AM"));
        Course cs410 = courseRepository.save(new Course(
                "cs410", "CS 410", "Introduction to Machine Learning", "Dr. Alan Wu", "#fb7185", 4, "Mon · 2:00 PM"));

        // ── Advanced Data Structures ───────────────────────────────────────
        task(cs301, "Finish graph algorithms problem set", Priority.HIGH, TaskStatus.TODO, 0, 23, 59, 90,
                "Problems 4–9, include complexity analysis.", null);
        task(cs301, "Implement red-black tree insertion", Priority.HIGH, TaskStatus.IN_PROGRESS, 1, 22, 0, 120,
                null, null);
        task(cs301, "Prepare for data structures midterm", Priority.HIGH, TaskStatus.TODO, 6, 9, 0, 180,
                null, null);
        task(cs301, "Review AVL rotations notes", Priority.MEDIUM, TaskStatus.DONE, -1, 18, 0, 45,
                null, completedAt(-1, 17, 10));
        task(cs301, "Week 6 lecture reflection", Priority.LOW, TaskStatus.DONE, -3, 20, 0, 20,
                null, completedAt(-3, 19, 30));

        // ── Operating Systems ──────────────────────────────────────────────
        task(cs320, "Review deadlock detection notes", Priority.MEDIUM, TaskStatus.TODO, 0, 20, 0, 45,
                null, null);
        task(cs320, "OS lab 4: memory paging", Priority.HIGH, TaskStatus.IN_PROGRESS, 3, 23, 59, 150,
                "Submit source, test output and a short reflection.", null);
        task(cs320, "Group project sync", Priority.LOW, TaskStatus.TODO, 2, 13, 0, 30, null, null);
        task(cs320, "Submit process scheduling lab", Priority.HIGH, TaskStatus.TODO, -1, 23, 59, 60,
                null, null);
        task(cs320, "Read chapter 8: virtual memory", Priority.MEDIUM, TaskStatus.DONE, -1, 21, 0, 60,
                null, completedAt(-1, 20, 5));

        // ── Linear Algebra ─────────────────────────────────────────────────
        task(math204, "Linear algebra quiz prep", Priority.HIGH, TaskStatus.IN_PROGRESS, 0, 18, 0, 60,
                "Focus on eigenvalues and diagonalisation.", null);
        task(math204, "Practice eigenvalues worksheet", Priority.MEDIUM, TaskStatus.TODO, 2, 22, 0, 75,
                null, null);
        task(math204, "Office hours: vector spaces", Priority.LOW, TaskStatus.TODO, 4, 15, 0, 30,
                null, null);
        task(math204, "Submit problem set 5", Priority.HIGH, TaskStatus.DONE, -4, 23, 59, 90,
                null, completedAt(-4, 21, 45));
        task(math204, "Watch matrix transformations lecture", Priority.LOW, TaskStatus.DONE, -2, 17, 0, 40,
                null, completedAt(-2, 16, 20));

        // ── Technical Writing ──────────────────────────────────────────────
        task(eng210, "Draft technical report introduction", Priority.MEDIUM, TaskStatus.TODO, 1, 17, 0, 120,
                "Hook, problem statement and evaluation criteria.", null);
        task(eng210, "Peer review: Jamie's proposal", Priority.MEDIUM, TaskStatus.TODO, 3, 12, 0, 45,
                null, null);
        task(eng210, "Post weekly reflection", Priority.LOW, TaskStatus.DONE, 0, 9, 0, 20,
                null, completedAt(0, 8, 40));
        task(eng210, "Submit annotated bibliography", Priority.HIGH, TaskStatus.DONE, -1, 23, 59, 60,
                null, completedAt(-1, 22, 35));

        // ── Machine Learning ───────────────────────────────────────────────
        task(cs410, "Read chapter 6: support vector machines", Priority.LOW, TaskStatus.TODO, 2, 21, 0, 60,
                null, null);
        task(cs410, "ML assignment 3: linear regression", Priority.HIGH, TaskStatus.TODO, -2, 23, 59, 120,
                null, null);
        task(cs410, "Project proposal: study assistant", Priority.HIGH, TaskStatus.IN_PROGRESS, 5, 23, 59, 90,
                null, null);
        task(cs410, "Watch backpropagation lecture", Priority.MEDIUM, TaskStatus.DONE, -2, 15, 0, 50,
                null, completedAt(-2, 14, 10));

        // ── Weekly timetable ───────────────────────────────────────────────
        scheduleEvent(0, "10:00", "11:30", "Data Structures", cs301, ScheduleEvent.EventType.CLASS);
        scheduleEvent(0, "14:00", "15:30", "Machine Learning", cs410, ScheduleEvent.EventType.CLASS);
        scheduleEvent(1, "09:00", "10:30", "Linear Algebra", math204, ScheduleEvent.EventType.CLASS);
        scheduleEvent(1, "13:00", "15:00", "OS Lab", cs320, ScheduleEvent.EventType.LAB);
        scheduleEvent(2, "11:00", "12:00", "Technical Writing", eng210, ScheduleEvent.EventType.CLASS);
        scheduleEvent(2, "15:00", "16:00", "DS Tutorial", cs301, ScheduleEvent.EventType.STUDY);
        scheduleEvent(3, "10:00", "11:30", "Operating Systems", cs320, ScheduleEvent.EventType.CLASS);
        scheduleEvent(3, "14:00", "16:00", "ML Lab", cs410, ScheduleEvent.EventType.LAB);
        scheduleEvent(4, "09:00", "10:30", "Linear Algebra", math204, ScheduleEvent.EventType.CLASS);
        scheduleEvent(4, "13:00", "14:00", "Group Project Sync", cs320, ScheduleEvent.EventType.STUDY);
    }

    private void task(
            Course course,
            String title,
            Priority priority,
            TaskStatus status,
            int dueDayOffset,
            int hour,
            int minute,
            int estimateMinutes,
            String notes,
            Instant completedAt
    ) {
        Task task = new Task();
        task.setTitle(title);
        task.setNotes(notes);
        task.setCourse(course);
        task.setPriority(priority);
        task.setStatus(status);
        task.setDueDate(at(dueDayOffset, hour, minute));
        task.setEstimateMinutes(estimateMinutes);
        task.setCompletedAt(completedAt);
        task.setCreatedAt(at(-21, 9, 0));
        taskRepository.save(task);
    }

    private void scheduleEvent(
            int dayIndex,
            String start,
            String end,
            String title,
            Course course,
            ScheduleEvent.EventType type
    ) {
        scheduleEventRepository.save(new ScheduleEvent(
                dayIndex,
                LocalTime.parse(start),
                LocalTime.parse(end),
                title,
                course,
                type
        ));
    }

    private Instant at(int dayOffset, int hour, int minute) {
        return LocalDate.now(zone)
                .plusDays(dayOffset)
                .atTime(hour, minute)
                .atZone(zone)
                .toInstant();
    }

    private Instant completedAt(int dayOffset, int hour, int minute) {
        return at(dayOffset, hour, minute);
    }
}
