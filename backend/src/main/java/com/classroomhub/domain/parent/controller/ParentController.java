package com.classroomhub.domain.parent.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.evaluation.dto.EvaluationResponse;
import com.classroomhub.domain.event.dto.AbsenceRequestResponse;
import com.classroomhub.domain.parent.dto.ChildClassroomResponse;
import com.classroomhub.domain.parent.dto.LinkedStudentResponse;
import com.classroomhub.domain.parent.dto.ParentAbsenceRequest;
import com.classroomhub.domain.parent.dto.ParentClassroomDetailResponse;
import com.classroomhub.domain.parent.service.ParentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/parent")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @GetMapping("/children")
    public ApiResponse<List<LinkedStudentResponse>> listChildren() {
        UUID parentId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(parentService.listMyChildren(parentId));
    }

    @GetMapping("/classrooms")
    public ApiResponse<List<ChildClassroomResponse>> listChildClassrooms() {
        UUID parentId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(parentService.listChildClassrooms(parentId));
    }

    @PostMapping("/children")
    public ApiResponse<LinkedStudentResponse> linkStudent(@RequestBody LinkRequest req) {
        UUID parentId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(parentService.linkStudent(parentId, req.studentCode(), req.relationship()));
    }

    @GetMapping("/classrooms/{classroomId}")
    public ApiResponse<ParentClassroomDetailResponse> getClassroomDetail(@PathVariable UUID classroomId) {
        UUID parentId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(parentService.getChildClassroomDetail(parentId, classroomId));
    }

    @GetMapping("/classrooms/{classroomId}/evaluations")
    public ApiResponse<List<EvaluationResponse>> getChildEvaluations(@PathVariable UUID classroomId) {
        UUID parentId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(parentService.getChildEvaluations(parentId, classroomId));
    }

    @PostMapping("/classrooms/{classroomId}/absence-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AbsenceRequestResponse> submitAbsence(
            @PathVariable UUID classroomId,
            @Valid @RequestBody ParentAbsenceRequest req) {
        UUID parentId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(parentService.submitAbsenceForChild(parentId, classroomId, req), "Đã gửi đơn xin nghỉ");
    }

    @DeleteMapping("/children/{linkId}")
    public ApiResponse<Void> unlinkStudent(@PathVariable UUID linkId) {
        UUID parentId = SecurityUtils.getCurrentUser().getId();
        parentService.unlinkStudent(parentId, linkId);
        return ApiResponse.ok(null, "Đã hủy liên kết");
    }

    public record LinkRequest(@NotBlank String studentCode, String relationship) {}
}
