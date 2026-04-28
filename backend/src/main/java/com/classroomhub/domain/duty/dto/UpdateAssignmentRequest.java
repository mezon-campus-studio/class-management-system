package com.classroomhub.domain.duty.dto;

import com.classroomhub.domain.duty.entity.DutyAssignment;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Edit an existing duty assignment. Any null field is left unchanged.
 */
public record UpdateAssignmentRequest(
        UUID dutyTypeId,
        UUID assignedToId,
        LocalDate dutyDate,
        DutyAssignment.Status status,
        String note
) {}
