package com.classroomhub.domain.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public record CreatePollRequest(
        @NotBlank(message = "Câu hỏi không được để trống")
        @Size(max = 500, message = "Câu hỏi tối đa 500 ký tự")
        String question,
        boolean multiChoice,
        boolean anonymous,
        Instant closesAt,
        @Size(min = 2, max = 20, message = "Cần từ 2 đến 20 lựa chọn")
        List<@NotBlank(message = "Lựa chọn không được để trống") String> options
) {}
