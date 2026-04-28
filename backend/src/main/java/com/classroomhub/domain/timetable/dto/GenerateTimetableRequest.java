package com.classroomhub.domain.timetable.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record GenerateTimetableRequest(
        @NotBlank String academicYear,
        @Min(1) @Max(2) int semester,
        boolean clearExisting,
        @NotEmpty List<ClassroomSpec> classrooms
) {
    public record ClassroomSpec(
            @NotNull UUID classroomId,
            @NotEmpty List<SubjectAssignment> assignments
    ) {}

    public record SubjectAssignment(
            @NotNull UUID subjectId,
            UUID teacherId,
            @Min(1) @Max(10) int periodsPerWeek
    ) {}
}
