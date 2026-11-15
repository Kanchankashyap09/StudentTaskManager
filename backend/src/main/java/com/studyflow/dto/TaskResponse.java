package com.studyflow.dto;

import com.studyflow.domain.Task;
import com.studyflow.domain.TaskStatus;
import com.studyflow.domain.Priority;

import java.time.Instant;

public record TaskResponse(
        String id,
        String title,
        String notes,
        String courseId,
        String priority,
        String status,
        Instant dueDate,
        int estimateMinutes,
        Instant completedAt,
        Instant createdAt
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getNotes(),
                task.getCourse().getId(),
                task.getPriority().wireName(),
                task.getStatus().wireName(),
                task.getDueDate(),
                task.getEstimateMinutes(),
                task.getCompletedAt(),
                task.getCreatedAt()
        );
    }
}
