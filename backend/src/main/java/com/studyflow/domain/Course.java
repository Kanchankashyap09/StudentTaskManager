package com.studyflow.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
public class Course {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 120)
    private String instructor;

    @Column(nullable = false, length = 9)
    private String color;

    @Column(nullable = false)
    private int credits;

    @Column(name = "next_class", nullable = false, length = 60)
    private String nextClass;

    public Course(String id, String code, String name, String instructor, String color, int credits, String nextClass) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.instructor = instructor;
        this.color = color;
        this.credits = credits;
        this.nextClass = nextClass;
    }
}
