package com.classroomhub.domain.classroom.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.classroom.dto.*;
import com.classroomhub.domain.classroom.service.ClassroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ClassroomController {

    private final ClassroomService classroomService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ClassroomResponse> create(@Valid @RequestBody CreateClassroomRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(classroomService.create(userId, req), "Tạo lớp học thành công");
    }

    @GetMapping
    public ApiResponse<List<ClassroomResponse>> listMine() {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(classroomService.listMyClassrooms(userId));
    }

    @GetMapping("/{classroomId}")
    public ApiResponse<ClassroomResponse> get(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(classroomService.get(classroomId, userId));
    }

    @PatchMapping("/{classroomId}")
    public ApiResponse<ClassroomResponse> update(
            @PathVariable UUID classroomId,
            @Valid @RequestBody UpdateClassroomRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(classroomService.update(classroomId, userId, req));
    }

    @PostMapping("/{classroomId}/invite-code/regenerate")
    public ApiResponse<String> regenerateInviteCode(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(classroomService.regenerateInviteCode(classroomId, userId), "Đã cấp mã mời mới");
    }

    @PostMapping("/join")
    public ApiResponse<ClassroomResponse> join(@RequestParam String code) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(classroomService.joinByCode(userId, code), "Tham gia lớp học thành công");
    }

    @DeleteMapping("/{classroomId}/leave")
    public ApiResponse<Void> leave(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        classroomService.leave(classroomId, userId);
        return ApiResponse.ok(null, "Rời lớp học thành công");
    }

    // ─── Members ───────────────────────────────────────────────────────────────

    @GetMapping("/{classroomId}/members")
    public ApiResponse<List<MemberResponse>> listMembers(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(classroomService.listMembers(classroomId, userId));
    }

    @PatchMapping("/{classroomId}/members/{memberId}/role")
    public ApiResponse<MemberResponse> updateRole(
            @PathVariable UUID classroomId,
            @PathVariable UUID memberId,
            @Valid @RequestBody UpdateMemberRoleRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(classroomService.updateMemberRole(classroomId, memberId, userId, req));
    }

    @PatchMapping("/{classroomId}/members/{memberId}/extras")
    public ApiResponse<MemberResponse> updateExtras(
            @PathVariable UUID classroomId,
            @PathVariable UUID memberId,
            @RequestBody UpdateMemberExtrasRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(classroomService.updateMemberExtras(classroomId, memberId, userId, req));
    }

    @DeleteMapping("/{classroomId}/members/{memberId}")
    public ApiResponse<Void> removeMember(
            @PathVariable UUID classroomId,
            @PathVariable UUID memberId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        classroomService.removeMember(classroomId, memberId, userId);
        return ApiResponse.ok(null, "Đã xóa thành viên");
    }
}
