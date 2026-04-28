package com.classroomhub.domain.attendance.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.attendance.dto.*;
import com.classroomhub.domain.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms/{classroomId}/attendance")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AttendanceController {

    private final AttendanceService attendanceService;

    // ─── Sessions ───────────────────────────────────────────────────────────────

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SessionResponse> createSession(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreateSessionRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(attendanceService.createSession(classroomId, userId, req), "Tạo phiên điểm danh thành công");
    }

    @GetMapping("/sessions")
    public ApiResponse<Page<SessionResponse>> listSessions(
            @PathVariable UUID classroomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return ApiResponse.ok(attendanceService.listSessions(classroomId, userId, pageable));
    }

    /**
     * Returns today's (or {@code date}'s) sessions, auto-generating any
     * that don't yet exist from the timetable. The student UI calls this
     * on mount so the list is always up-to-date for the chosen day.
     */
    @GetMapping("/daily")
    public ApiResponse<List<SessionResponse>> listByDate(
            @PathVariable UUID classroomId,
            @RequestParam(required = false) String date) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        java.time.LocalDate sessionDate = date != null
                ? java.time.LocalDate.parse(date)
                : java.time.LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
        return ApiResponse.ok(attendanceService.generateSessionsForDate(classroomId, userId, sessionDate));
    }

    /** Student self check-in. */
    @PostMapping("/sessions/{sessionId}/check-in")
    public ApiResponse<RecordResponse> checkIn(
            @PathVariable UUID classroomId,
            @PathVariable UUID sessionId,
            @Valid @RequestBody(required = false) CheckInRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(attendanceService.checkIn(classroomId, sessionId, userId, req));
    }

    @GetMapping("/sessions/{sessionId}")
    public ApiResponse<SessionResponse> getSession(
            @PathVariable UUID classroomId,
            @PathVariable UUID sessionId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(attendanceService.getSession(classroomId, sessionId, userId));
    }

    @PostMapping("/sessions/{sessionId}/close")
    public ApiResponse<SessionResponse> closeSession(
            @PathVariable UUID classroomId,
            @PathVariable UUID sessionId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(attendanceService.closeSession(classroomId, sessionId, userId), "Đã đóng phiên điểm danh");
    }

    @DeleteMapping("/sessions/{sessionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSession(
            @PathVariable UUID classroomId,
            @PathVariable UUID sessionId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        attendanceService.deleteSession(classroomId, sessionId, userId);
    }

    // ─── Records ─────────────────────────────────────────────────────────────────

    @GetMapping("/sessions/{sessionId}/records")
    public ApiResponse<List<RecordResponse>> listRecords(
            @PathVariable UUID classroomId,
            @PathVariable UUID sessionId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(attendanceService.listRecords(classroomId, sessionId, userId));
    }

    @PatchMapping("/sessions/{sessionId}/records/{recordId}")
    public ApiResponse<RecordResponse> markAttendance(
            @PathVariable UUID classroomId,
            @PathVariable UUID sessionId,
            @PathVariable UUID recordId,
            @Valid @RequestBody MarkAttendanceRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(attendanceService.markAttendance(classroomId, sessionId, recordId, userId, req));
    }
}
