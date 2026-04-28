package com.classroomhub.domain.classroom.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateClassroomRequest(
        @Size(min = 2, max = 100, message = "Tên lớp từ 2–100 ký tự")
        String name,

        @Size(max = 1000, message = "Mô tả tối đa 1000 ký tự")
        String description,

        String coverImageUrl,

        @Min(value = 2) @Max(value = 500)
        Integer maxMembers
) {}
