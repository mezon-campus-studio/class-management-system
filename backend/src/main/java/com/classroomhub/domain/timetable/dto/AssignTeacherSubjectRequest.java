package com.classroomhub.domain.timetable.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignTeacherSubjectRequest(
        @NotNull UUID teacherId,
        @NotNull UUID subjectId
) {}
