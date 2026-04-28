package com.classroomhub.domain.parent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ParentAbsenceRequest(
        @NotNull LocalDate date,
        @NotBlank String reason,
        String note
) {}
