package com.classroomhub.domain.timetable.dto;

import java.time.Instant;
import java.util.UUID;

public record SwapRequestResponse(
        UUID id,
        UUID requesterId,
        String requesterName,
        TimetableEntryResponse requesterEntry,
        UUID targetTeacherId,
        String targetTeacherName,
        TimetableEntryResponse targetEntry,
        String status,
        String reason,
        UUID reviewedById,
        String reviewNote,
        Instant reviewedAt,
        Instant createdAt
) {}
