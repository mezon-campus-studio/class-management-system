package com.classroomhub.domain.emulation.dto;

public record UpdateCategoryRequest(
        String name,
        String description,
        int defaultScore,
        boolean active
) {}
