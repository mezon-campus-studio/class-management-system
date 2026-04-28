package com.classroomhub.domain.duty.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.duty.dto.*;
import com.classroomhub.domain.duty.service.DutyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms/{classroomId}/duty")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class DutyController {

    private final DutyService dutyService;

    @PostMapping("/types")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DutyTypeResponse> createDutyType(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreateDutyTypeRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(dutyService.createDutyType(classroomId, req, userId));
    }

    @GetMapping("/types")
    public ApiResponse<List<DutyTypeResponse>> listDutyTypes(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(dutyService.listDutyTypes(classroomId, userId));
    }

    @PutMapping("/types/{typeId}")
    public ApiResponse<DutyTypeResponse> updateDutyType(
            @PathVariable UUID classroomId,
            @PathVariable UUID typeId,
            @RequestBody UpdateDutyTypeRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(dutyService.updateDutyType(classroomId, typeId, req, userId));
    }

    @DeleteMapping("/types/{typeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDutyType(
            @PathVariable UUID classroomId,
            @PathVariable UUID typeId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        dutyService.deleteDutyType(classroomId, typeId, userId);
    }

    @PostMapping("/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AssignmentResponse> createAssignment(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreateAssignmentRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(dutyService.createAssignment(classroomId, req, userId));
    }

    @GetMapping("/assignments")
    public ApiResponse<List<AssignmentResponse>> listAssignments(
            @PathVariable UUID classroomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(dutyService.listAssignments(classroomId, date, userId));
    }

    @GetMapping("/assignments/me")
    public ApiResponse<List<AssignmentResponse>> listMyAssignments(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(dutyService.listMyAssignments(classroomId, userId));
    }

    @PostMapping("/assignments/{id}/confirm")
    public ApiResponse<AssignmentResponse> confirmCompletion(
            @PathVariable UUID classroomId,
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(dutyService.confirmCompletion(classroomId, id, userId));
    }

    @PutMapping("/assignments/{id}")
    public ApiResponse<AssignmentResponse> updateAssignment(
            @PathVariable UUID classroomId,
            @PathVariable UUID id,
            @RequestBody UpdateAssignmentRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(dutyService.updateAssignment(classroomId, id, req, userId));
    }

    @DeleteMapping("/assignments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAssignment(
            @PathVariable UUID classroomId,
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        dutyService.deleteAssignment(classroomId, id, userId);
    }
}
