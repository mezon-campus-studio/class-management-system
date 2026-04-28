package com.classroomhub.domain.duty.dto;

import java.util.UUID;

public record DutyTypeResponse(
        UUID id,
        String name,
        String description,
        boolean active
) {}
