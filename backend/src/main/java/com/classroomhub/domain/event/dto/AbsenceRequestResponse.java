package com.classroomhub.domain.event.dto;

import com.classroomhub.domain.event.entity.AbsenceRequest;

import java.time.Instant;
import java.util.UUID;

public record AbsenceRequestResponse(
        UUID id,
        UUID userId,
        UUID eventId,
        String reason,
        AbsenceRequest.Status status,
        UUID reviewedById,
        String reviewNote,
        Instant reviewedAt,
        Instant createdAt
) {}
