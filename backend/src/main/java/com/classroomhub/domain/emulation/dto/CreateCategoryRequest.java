package com.classroomhub.domain.emulation.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryRequest(
        @NotBlank String name,
        String description,
        int defaultScore
) {}
