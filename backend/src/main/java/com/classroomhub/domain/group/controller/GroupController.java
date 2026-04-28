package com.classroomhub.domain.group.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.group.dto.*;
import com.classroomhub.domain.group.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms/{classroomId}/groups")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<GroupResponse> create(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreateGroupRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(groupService.create(classroomId, userId, req), "Tạo tổ thành công");
    }

    @GetMapping
    public ApiResponse<List<GroupResponse>> list(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(groupService.listByClassroom(classroomId, userId));
    }

    @GetMapping("/{groupId}")
    public ApiResponse<GroupResponse> get(
            @PathVariable UUID classroomId,
            @PathVariable UUID groupId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(groupService.get(classroomId, groupId, userId));
    }

    @PatchMapping("/{groupId}")
    public ApiResponse<GroupResponse> update(
            @PathVariable UUID classroomId,
            @PathVariable UUID groupId,
            @Valid @RequestBody CreateGroupRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(groupService.update(classroomId, groupId, userId, req));
    }

    @DeleteMapping("/{groupId}")
    public ApiResponse<Void> delete(
            @PathVariable UUID classroomId,
            @PathVariable UUID groupId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        groupService.delete(classroomId, groupId, userId);
        return ApiResponse.ok(null, "Đã xóa tổ");
    }

    @PostMapping("/{groupId}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<GroupResponse> addMember(
            @PathVariable UUID classroomId,
            @PathVariable UUID groupId,
            @Valid @RequestBody AddGroupMemberRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(groupService.addMember(classroomId, groupId, userId, req));
    }

    @DeleteMapping("/{groupId}/members/{groupMemberId}")
    public ApiResponse<Void> removeMember(
            @PathVariable UUID classroomId,
            @PathVariable UUID groupId,
            @PathVariable UUID groupMemberId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        groupService.removeMember(classroomId, groupId, groupMemberId, userId);
        return ApiResponse.ok(null, "Đã xóa thành viên khỏi tổ");
    }
}
