package com.classroomhub.domain.timetable.dto;

import jakarta.validation.constraints.NotNull;

public record ReviewSwapRequestDto(
        @NotNull boolean approved,
        String reviewNote
) {}
