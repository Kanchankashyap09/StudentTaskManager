package com.studyflow.service;

import com.studyflow.domain.Course;
import com.studyflow.domain.Priority;
import com.studyflow.domain.Task;
import com.studyflow.domain.TaskStatus;
import com.studyflow.dto.CreateTaskRequest;
import com.studyflow.dto.TaskResponse;
import com.studyflow.dto.UpdateTaskRequest;
import com.studyflow.exception.NotFoundException;
import com.studyflow.repository.CourseRepository;
import com.studyflow.repository.TaskRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final CourseRepository courseRepository;

    public TaskService(TaskRepository taskRepository, CourseRepository courseRepository) {
        this.taskRepository = taskRepository;
        this.courseRepository = courseRepository;
    }

    public List<TaskResponse> findAll(String status, String courseId, String priority, String query) {
        TaskStatus statusFilter = status == null || status.isBlank() ? null : TaskStatus.from(status);
        Priority priorityFilter = priority == null || priority.isBlank() ? null : Priority.from(priority);
        String needle = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);

        List<Task> tasks = taskRepository.findAll(Sort.by(Sort.Direction.ASC, "dueDate"));

        return tasks.stream()
                .filter(task -> statusFilter == null || task.getStatus() == statusFilter)
                .filter(task -> courseId == null || courseId.isBlank() || task.getCourse().getId().equals(courseId))
                .filter(task -> priorityFilter == null || task.getPriority() == priorityFilter)
                .filter(task -> needle.isEmpty() || matches(task, needle))
                .sorted(Comparator
                        .comparing((Task task) -> task.getStatus() == TaskStatus.DONE)
                        .thenComparing(Task::getDueDate))
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse findById(String id) {
        return TaskResponse.from(getTask(id));
    }

    @Transactional
    public TaskResponse create(CreateTaskRequest request) {
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new NotFoundException("Course not found: " + request.courseId()));

        Task task = new Task();
        task.setTitle(request.title().trim());
        task.setNotes(trimToNull(request.notes()));
        task.setCourse(course);
        task.setPriority(Priority.from(request.priority()));
        task.setStatus(TaskStatus.TODO);
        task.setDueDate(request.dueDate());
        task.setEstimateMinutes(request.estimateMinutes() == null ? 60 : request.estimateMinutes());
        task.setCreatedAt(Instant.now());

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(String id, UpdateTaskRequest request) {
        Task task = getTask(id);

        if (request.title() != null) {
            String title = request.title().trim();
            if (title.isEmpty()) {
                throw new IllegalArgumentException("Task title cannot be blank");
            }
            task.setTitle(title);
        }
        if (request.notes() != null) {
            task.setNotes(trimToNull(request.notes()));
        }
        if (request.courseId() != null && !request.courseId().isBlank()) {
            Course course = courseRepository.findById(request.courseId())
                    .orElseThrow(() -> new NotFoundException("Course not found: " + request.courseId()));
            task.setCourse(course);
        }
        if (request.priority() != null) {
            task.setPriority(Priority.from(request.priority()));
        }
        if (request.status() != null) {
            TaskStatus newStatus = TaskStatus.from(request.status());
            task.setStatus(newStatus);
            if (newStatus == TaskStatus.DONE) {
                if (task.getCompletedAt() == null) {
                    task.setCompletedAt(Instant.now());
                }
            } else {
                task.setCompletedAt(null);
            }
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }
        if (request.estimateMinutes() != null) {
            task.setEstimateMinutes(request.estimateMinutes());
        }

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse toggle(String id) {
        Task task = getTask(id);
        if (task.getStatus() == TaskStatus.DONE) {
            task.setStatus(TaskStatus.TODO);
            task.setCompletedAt(null);
        } else {
            task.setStatus(TaskStatus.DONE);
            task.setCompletedAt(Instant.now());
        }
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void delete(String id) {
        Task task = getTask(id);
        taskRepository.delete(task);
    }

    private Task getTask(String id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task not found: " + id));
    }

    private boolean matches(Task task, String needle) {
        return task.getTitle().toLowerCase(Locale.ROOT).contains(needle)
                || (task.getNotes() != null && task.getNotes().toLowerCase(Locale.ROOT).contains(needle))
                || task.getCourse().getCode().toLowerCase(Locale.ROOT).contains(needle)
                || task.getCourse().getName().toLowerCase(Locale.ROOT).contains(needle);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
