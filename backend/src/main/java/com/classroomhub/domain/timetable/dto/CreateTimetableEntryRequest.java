package com.classroomhub.domain.timetable.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateTimetableEntryRequest(
        @NotNull UUID classroomId,
        @NotNull UUID subjectId,
        UUID teacherId,
        @NotNull String dayOfWeek,
        @Min(1) @Max(10) int period,
        @NotBlank String academicYear,
        @Min(1) @Max(2) int semester
) {}
