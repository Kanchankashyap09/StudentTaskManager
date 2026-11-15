package com.studyflow.service;

import com.studyflow.dto.ScheduleEventResponse;
import com.studyflow.repository.ScheduleEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleEventRepository scheduleEventRepository;

    public ScheduleService(ScheduleEventRepository scheduleEventRepository) {
        this.scheduleEventRepository = scheduleEventRepository;
    }

    public List<ScheduleEventResponse> findAll() {
        return scheduleEventRepository.findAllByOrderByDayIndexAscStartTimeAsc().stream()
                .map(ScheduleEventResponse::from)
                .toList();
    }
}
