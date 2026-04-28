package com.classroomhub.domain.timetable.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.UUID;

public record GenerateFromConfigRequest(
        @NotBlank String academicYear,
        @Min(1) @Max(2) int semester,
        boolean clearExisting,
        List<UUID> classroomIds  // null or empty = all configured classrooms
) {}
