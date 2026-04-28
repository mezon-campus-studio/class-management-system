package com.classroomhub.domain.evaluation.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.evaluation.dto.EvaluationRequest;
import com.classroomhub.domain.evaluation.dto.EvaluationResponse;
import com.classroomhub.domain.evaluation.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms/{classroomId}/evaluations")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    /** List all evaluations in the classroom (accessible to any member). */
    @GetMapping
    public ApiResponse<List<EvaluationResponse>> list(@PathVariable UUID classroomId) {
        UUID me = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(evaluationService.listByClassroom(classroomId, me));
    }

    /** List evaluations for a specific student (accessible to any member). */
    @GetMapping("/students/{studentId}")
    public ApiResponse<List<EvaluationResponse>> listByStudent(
            @PathVariable UUID classroomId, @PathVariable UUID studentId) {
        UUID me = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(evaluationService.listByStudent(classroomId, studentId, me));
    }

    /** Create evaluation — requires TEACHER or OWNER role in the classroom. */
    @PostMapping
    public ApiResponse<EvaluationResponse> create(
            @PathVariable UUID classroomId, @Valid @RequestBody EvaluationRequest req) {
        UUID me = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(evaluationService.create(classroomId, me, req), "Đã thêm đánh giá");
    }

    /** Delete evaluation — only author or OWNER may delete. */
    @DeleteMapping("/{evaluationId}")
    public ApiResponse<Void> delete(
            @PathVariable UUID classroomId, @PathVariable UUID evaluationId) {
        UUID me = SecurityUtils.getCurrentUser().getId();
        evaluationService.delete(classroomId, evaluationId, me);
        return ApiResponse.ok(null, "Đã xóa đánh giá");
    }
}
