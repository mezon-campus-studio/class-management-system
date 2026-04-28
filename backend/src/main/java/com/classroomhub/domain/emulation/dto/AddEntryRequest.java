package com.classroomhub.domain.emulation.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record AddEntryRequest(
        @NotNull UUID categoryId,
        @NotNull UUID memberId,
        int score,
        String note,
        Instant occurredAt
) {}
