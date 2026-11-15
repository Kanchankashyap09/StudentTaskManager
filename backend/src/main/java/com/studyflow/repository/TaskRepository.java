package com.studyflow.repository;

import com.studyflow.domain.Task;
import com.studyflow.domain.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, String> {

    long countByCourse_Id(String courseId);

    long countByCourse_IdAndStatus(String courseId, TaskStatus status);
}
