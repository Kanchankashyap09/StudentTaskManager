package com.studyflow.domain;

import java.util.Locale;

public enum TaskStatus {
    TODO,
    IN_PROGRESS,
    DONE;

    public static TaskStatus from(String value) {
        if (value == null || value.isBlank()) {
            return TODO;
        }
        try {
            return valueOf(value.trim().toUpperCase(Locale.ROOT).replace('-', '_'));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid task status: " + value);
        }
    }

    public String wireName() {
        return name().toLowerCase(Locale.ROOT).replace('_', '-');
    }
}
