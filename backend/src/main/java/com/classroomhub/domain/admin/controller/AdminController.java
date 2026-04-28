package com.classroomhub.domain.admin.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.domain.admin.dto.AdminClassroomResponse;
import com.classroomhub.domain.admin.dto.AdminMetricsResponse;
import com.classroomhub.domain.admin.dto.AdminUserResponse;
import com.classroomhub.domain.admin.service.AdminService;
import com.classroomhub.domain.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/metrics")
    public ApiResponse<AdminMetricsResponse> metrics() {
        return ApiResponse.ok(adminService.getMetrics());
    }

    @GetMapping("/users")
    public ApiResponse<Page<AdminUserResponse>> listUsers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) User.UserType userType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listUsers(q, userType, page, Math.min(size, 100)));
    }

    @PatchMapping("/users/{userId}/status")
    public ApiResponse<AdminUserResponse> setUserStatus(
            @PathVariable UUID userId,
            @RequestBody StatusRequest req) {
        return ApiResponse.ok(adminService.setUserStatus(userId, req.status()));
    }

    @GetMapping("/classrooms")
    public ApiResponse<Page<AdminClassroomResponse>> listClassrooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listClassrooms(page, Math.min(size, 100)));
    }

    @PostMapping("/classrooms/{classroomId}/archive")
    public ApiResponse<Void> archiveClassroom(@PathVariable UUID classroomId) {
        adminService.archiveClassroom(classroomId);
        return ApiResponse.ok(null, "Đã lưu trữ lớp học");
    }

    public record StatusRequest(User.Status status) {}
}
