package com.classroomhub.domain.event.dto;

import com.classroomhub.domain.event.entity.AbsenceRequest;
import jakarta.validation.constraints.NotNull;

public record ReviewAbsenceRequest(
        @NotNull AbsenceRequest.Status status,
        String reviewNote
) {}
