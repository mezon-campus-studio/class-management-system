package com.classroomhub.domain.evaluation.dto;

import com.classroomhub.domain.evaluation.entity.StudentEvaluation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record EvaluationRequest(
        @NotNull UUID studentId,
        StudentEvaluation.Category category,
        @Min(0) @Max(10) Integer score,
        String title,
        @NotBlank String content,
        String period
) {}
