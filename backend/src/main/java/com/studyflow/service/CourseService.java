package com.studyflow.service;

import com.studyflow.domain.Course;
import com.studyflow.domain.TaskStatus;
import com.studyflow.dto.CourseResponse;
import com.studyflow.exception.NotFoundException;
import com.studyflow.repository.CourseRepository;
import com.studyflow.repository.TaskRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final TaskRepository taskRepository;

    public CourseService(CourseRepository courseRepository, TaskRepository taskRepository) {
        this.courseRepository = courseRepository;
        this.taskRepository = taskRepository;
    }

    public List<CourseResponse> findAll() {
        return courseRepository.findAll(Sort.by("code")).stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseResponse findById(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found: " + id));
        return toResponse(course);
    }

    private CourseResponse toResponse(Course course) {
        long total = taskRepository.countByCourse_Id(course.getId());
        long completed = taskRepository.countByCourse_IdAndStatus(course.getId(), TaskStatus.DONE);
        return new CourseResponse(
                course.getId(),
                course.getCode(),
                course.getName(),
                course.getInstructor(),
                course.getColor(),
                course.getCredits(),
                course.getNextClass(),
                total,
                completed
        );
    }
}
