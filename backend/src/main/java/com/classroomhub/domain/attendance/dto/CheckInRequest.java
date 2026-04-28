package com.classroomhub.domain.attendance.dto;

import jakarta.validation.constraints.Size;

public record CheckInRequest(
        @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
        String note
) {}
