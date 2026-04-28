package com.classroomhub.domain.emulation.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Edit an existing emulation entry. Any field may be null to leave it
 * unchanged. {@code score} uses {@link Integer} so 0 is distinguishable
 * from "no change".
 */
public record UpdateEntryRequest(
        UUID categoryId,
        Integer score,
        String note,
        Instant occurredAt
) {}
