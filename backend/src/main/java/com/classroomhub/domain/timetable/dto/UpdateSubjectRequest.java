package com.classroomhub.domain.timetable.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateSubjectRequest(
        String name,
        @Size(max = 20) String code,
        @Min(1) @Max(20) Integer periodsPerWeek,
        String colorHex
) {}
