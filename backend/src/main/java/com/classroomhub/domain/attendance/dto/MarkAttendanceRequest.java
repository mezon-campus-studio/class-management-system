package com.classroomhub.domain.attendance.dto;

import com.classroomhub.domain.attendance.entity.AttendanceRecord;
import jakarta.validation.constraints.NotNull;

public record MarkAttendanceRequest(
        @NotNull AttendanceRecord.Status status,
        String note
) {}
