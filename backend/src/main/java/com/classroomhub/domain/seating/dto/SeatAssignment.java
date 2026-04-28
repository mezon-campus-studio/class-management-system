package com.classroomhub.domain.seating.dto;

import java.util.UUID;

public record SeatAssignment(
        String seatKey,
        UUID userId,
        String displayName,
        String avatarUrl,
        /** PRESENT, EXCUSED, ABSENT, UNMARKED. */
        String attendanceStatus
) {}
