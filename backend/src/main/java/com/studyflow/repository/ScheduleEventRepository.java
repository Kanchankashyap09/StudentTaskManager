package com.studyflow.repository;

import com.studyflow.domain.ScheduleEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, String> {

    List<ScheduleEvent> findAllByOrderByDayIndexAscStartTimeAsc();
}
