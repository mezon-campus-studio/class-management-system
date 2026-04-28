package com.classroomhub.domain.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateEventRequest(
        @NotBlank String title,
        String description,
        @NotNull Instant startTime,
        Instant endTime,
        String location,
        boolean mandatory
) {}
