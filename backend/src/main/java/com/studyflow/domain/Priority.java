package com.studyflow.domain;

import java.util.Locale;

public enum Priority {
    LOW,
    MEDIUM,
    HIGH;

    public static Priority from(String value) {
        if (value == null || value.isBlank()) {
            return MEDIUM;
        }
        try {
            return valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid priority: " + value);
        }
    }

    public String wireName() {
        return name().toLowerCase(Locale.ROOT);
    }
}
