package com.studyflow.dto;

import com.studyflow.domain.ScheduleEvent;

import java.time.format.DateTimeFormatter;

public record ScheduleEventResponse(
        String id,
        int day,
        String start,
        String end,
        String title,
        String courseId,
        String type
) {
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    public static ScheduleEventResponse from(ScheduleEvent event) {
        return new ScheduleEventResponse(
                event.getId(),
                event.getDayIndex(),
                event.getStartTime().format(TIME_FORMAT),
                event.getEndTime().format(TIME_FORMAT),
                event.getTitle(),
                event.getCourse().getId(),
                event.getType().name().toLowerCase()
        );
    }
}
