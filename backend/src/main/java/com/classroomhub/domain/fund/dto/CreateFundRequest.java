package com.classroomhub.domain.fund.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateFundRequest(
        @NotBlank String name,
        String description
) {}
