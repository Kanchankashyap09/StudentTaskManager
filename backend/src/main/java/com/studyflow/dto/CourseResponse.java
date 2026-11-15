package com.studyflow.dto;

public record CourseResponse(
        String id,
        String code,
        String name,
        String instructor,
        String color,
        int credits,
        String nextClass,
        long totalTasks,
        long completedTasks
) {
}
