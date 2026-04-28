package com.classroomhub.domain.timetable.dto;

import java.time.Instant;
import java.util.UUID;

public record SubjectResponse(
        UUID id,
        String name,
        String code,
        int periodsPerWeek,
        String colorHex,
        Instant createdAt
) {}
