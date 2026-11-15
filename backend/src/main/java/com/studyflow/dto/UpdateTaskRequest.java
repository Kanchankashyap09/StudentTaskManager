package com.studyflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record UpdateTaskRequest(
        @Size(min = 1, max = 180) String title,
        @Size(max = 2000) String notes,
        String courseId,
        String priority,
        @Pattern(regexp = "(?i)^(todo|in-progress|in_progress|done)$", message = "Status must be todo, in-progress or done")
        String status,
        Instant dueDate,
        @Min(5) @Max(1440) Integer estimateMinutes
) {
}
