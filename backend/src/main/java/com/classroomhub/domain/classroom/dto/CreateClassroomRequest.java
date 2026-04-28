package com.classroomhub.domain.classroom.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateClassroomRequest(
        @NotBlank(message = "Tên lớp không được để trống")
        @Size(min = 2, max = 100, message = "Tên lớp từ 2–100 ký tự")
        String name,

        @Size(max = 1000, message = "Mô tả tối đa 1000 ký tự")
        String description,

        String coverImageUrl,

        @Min(value = 2, message = "Tối thiểu 2 thành viên")
        @Max(value = 500, message = "Tối đa 500 thành viên")
        Integer maxMembers
) {}
