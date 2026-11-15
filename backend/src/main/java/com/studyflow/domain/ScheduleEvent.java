package com.studyflow.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Table(name = "schedule_events")
@Getter
@Setter
@NoArgsConstructor
public class ScheduleEvent {

    public enum EventType {
        CLASS,
        LAB,
        STUDY
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    /** 0 = Monday … 6 = Sunday */
    @Column(name = "day_index", nullable = false)
    private int dayIndex;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, length = 120)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private EventType type;

    public ScheduleEvent(int dayIndex, LocalTime startTime, LocalTime endTime, String title, Course course, EventType type) {
        this.dayIndex = dayIndex;
        this.startTime = startTime;
        this.endTime = endTime;
        this.title = title;
        this.course = course;
        this.type = type;
    }
}
