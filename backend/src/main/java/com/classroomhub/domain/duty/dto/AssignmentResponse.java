package com.classroomhub.domain.duty.dto;

import com.classroomhub.domain.duty.entity.DutyAssignment;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AssignmentResponse(
        UUID id,
        UUID dutyTypeId,
        String dutyTypeName,
        UUID assignedToId,
        LocalDate dutyDate,
        DutyAssignment.Status status,
        String note,
        UUID confirmedById,
        Instant confirmedAt
) {}
