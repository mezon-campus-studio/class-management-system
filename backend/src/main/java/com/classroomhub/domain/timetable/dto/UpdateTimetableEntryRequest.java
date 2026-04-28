package com.classroomhub.domain.timetable.dto;

import java.util.UUID;

public record UpdateTimetableEntryRequest(
        UUID subjectId,
        UUID teacherId,
        String dayOfWeek,
        Integer period
) {}
