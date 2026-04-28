package com.classroomhub.domain.timetable.dto;

import java.time.Instant;
import java.util.UUID;

public record ClassroomSubjectConfigResponse(
        UUID id,
        UUID classroomId,
        String classroomName,
        UUID subjectId,
        String subjectName,
        String subjectCode,
        String subjectColor,
        UUID teacherId,
        String teacherName,
        int periodsPerWeek,
        Instant createdAt
) {}
