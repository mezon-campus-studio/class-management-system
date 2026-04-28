package com.classroomhub.domain.group.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateGroupRequest(
        @NotBlank(message = "Tên tổ không được để trống")
        @Size(min = 1, max = 50, message = "Tên tổ tối đa 50 ký tự")
        String name,

        @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
        String description
) {}
