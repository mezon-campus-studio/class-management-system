package com.classroomhub.domain.emulation.dto;

import java.time.Instant;
import java.util.UUID;

public record EntryResponse(
        UUID id,
        UUID categoryId,
        String categoryName,
        UUID memberId,
        int score,
        String note,
        UUID recordedById,
        Instant occurredAt,
        Instant createdAt
) {}
