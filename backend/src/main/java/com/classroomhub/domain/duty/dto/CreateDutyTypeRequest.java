package com.classroomhub.domain.duty.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateDutyTypeRequest(
        @NotBlank String name,
        String description
) {}
