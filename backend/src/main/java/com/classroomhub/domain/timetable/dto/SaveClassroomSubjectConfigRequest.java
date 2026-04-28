package com.classroomhub.domain.timetable.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SaveClassroomSubjectConfigRequest(
        @NotNull UUID classroomId,
        @NotNull UUID subjectId,
        UUID teacherId,
        @Min(1) @Max(20) int periodsPerWeek
) {}
