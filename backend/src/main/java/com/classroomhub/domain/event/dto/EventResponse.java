package com.classroomhub.domain.event.dto;

import java.time.Instant;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String title,
        String description,
        Instant startTime,
        Instant endTime,
        String location,
        boolean mandatory,
        UUID createdById,
        Instant createdAt
) {}
