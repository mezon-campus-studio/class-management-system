package com.classroomhub.domain.evaluation.dto;

import com.classroomhub.domain.evaluation.entity.StudentEvaluation;

import java.time.Instant;
import java.util.UUID;

public record EvaluationResponse(
        UUID id,
        UUID classroomId,
        UUID studentId,
        String studentName,
        UUID teacherId,
        String teacherName,
        StudentEvaluation.Category category,
        Integer score,
        String title,
        String content,
        String period,
        Instant createdAt
) {}
