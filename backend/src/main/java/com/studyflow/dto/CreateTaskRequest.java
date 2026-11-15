package com.studyflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateTaskRequest(
        @NotBlank @Size(max = 180) String title,
        @Size(max = 2000) String notes,
        @NotBlank String courseId,
        String priority,
        @NotNull Instant dueDate,
        @Min(5) @Max(1440) Integer estimateMinutes
) {
}
