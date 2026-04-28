package com.classroomhub.domain.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateSessionRequest(
        @NotBlank(message = "Tiêu đề không được để trống")
        @Size(max = 200, message = "Tiêu đề tối đa 200 ký tự")
        String title,

        @Size(max = 1000, message = "Mô tả tối đa 1000 ký tự")
        String description,

        Instant closesAt
) {}
