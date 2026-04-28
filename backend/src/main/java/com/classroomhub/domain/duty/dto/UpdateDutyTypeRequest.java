package com.classroomhub.domain.duty.dto;

public record UpdateDutyTypeRequest(
        String name,
        String description,
        boolean active
) {}
