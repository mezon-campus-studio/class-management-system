package com.classroomhub.domain.emulation.dto;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String description,
        int defaultScore,
        boolean active
) {}
