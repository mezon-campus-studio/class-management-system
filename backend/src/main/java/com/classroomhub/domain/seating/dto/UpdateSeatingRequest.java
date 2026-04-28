package com.classroomhub.domain.seating.dto;

import java.util.Map;
import java.util.UUID;

public record UpdateSeatingRequest(
        Integer rowsCount,
        Integer seatsPerSide,
        /** seatKey → userId. Null/missing keys clear the seat. */
        Map<String, UUID> assignments
) {}
