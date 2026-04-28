package com.classroomhub.domain.seating.dto;

import java.util.List;

public record SeatingResponse(
        int rowsCount,
        int seatsPerSide,
        List<SeatAssignment> seats,
        Stats stats
) {
    public record Stats(int total, int present, int excused, int absent, int unmarked) {}
}
