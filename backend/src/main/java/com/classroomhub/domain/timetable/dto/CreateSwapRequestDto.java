package com.classroomhub.domain.timetable.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateSwapRequestDto(
        @NotNull UUID requesterEntryId,
        @NotNull UUID targetTeacherId,
        UUID targetEntryId,
        String reason
) {}
