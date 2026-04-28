package com.classroomhub.domain.event.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CreateAbsenceRequest(
        @NotBlank String reason,
        UUID eventId
) {}
