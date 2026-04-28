package com.classroomhub.domain.duty.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateAssignmentRequest(
        @NotNull UUID dutyTypeId,
        @NotNull UUID assignedToId,
        @NotNull LocalDate dutyDate,
        String note
) {}
