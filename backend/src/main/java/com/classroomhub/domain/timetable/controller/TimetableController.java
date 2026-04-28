package com.classroomhub.domain.timetable.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.timetable.dto.*;
import com.classroomhub.domain.timetable.service.SubjectService;
import com.classroomhub.domain.timetable.service.SwapRequestService;
import com.classroomhub.domain.timetable.service.TeacherSubjectService;
import com.classroomhub.domain.timetable.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/timetable")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class TimetableController {

    private final SubjectService subjectService;
    private final TeacherSubjectService teacherSubjectService;
    private final TimetableService timetableService;
    private final SwapRequestService swapRequestService;

    // ─── Subjects ────────────────────────────────────────────────────────────────

    @GetMapping("/subjects")
    public ApiResponse<List<SubjectResponse>> listSubjects() {
        return ApiResponse.ok(subjectService.listAll());
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<SubjectResponse> createSubject(@Valid @RequestBody CreateSubjectRequest req) {
        return ApiResponse.ok(subjectService.create(req));
    }

    @PutMapping("/subjects/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<SubjectResponse> updateSubject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSubjectRequest req) {
        return ApiResponse.ok(subjectService.update(id, req));
    }

    @DeleteMapping("/subjects/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Void> deleteSubject(@PathVariable UUID id) {
        subjectService.delete(id);
        return ApiResponse.ok(null);
    }

    // ─── Teacher-Subject assignments ─────────────────────────────────────────────

    @GetMapping("/teacher-subjects")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<List<TeacherSubjectResponse>> listTeacherSubjects() {
        return ApiResponse.ok(teacherSubjectService.listAll());
    }

    @PostMapping("/teacher-subjects")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<TeacherSubjectResponse> assignTeacherSubject(
            @Valid @RequestBody AssignTeacherSubjectRequest req) {
        return ApiResponse.ok(teacherSubjectService.assign(req));
    }

    @DeleteMapping("/teacher-subjects/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Void> unassignTeacherSubject(@PathVariable UUID id) {
        teacherSubjectService.unassign(id);
        return ApiResponse.ok(null);
    }

    // ─── Timetable entries ───────────────────────────────────────────────────────

    @GetMapping("/entries")
    public ApiResponse<List<TimetableEntryResponse>> getEntries(
            @RequestParam UUID classroomId,
            @RequestParam String academicYear,
            @RequestParam int semester) {
        return ApiResponse.ok(timetableService.getByClassroom(classroomId, academicYear, semester));
    }

    @PostMapping("/entries")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<TimetableEntryResponse> createEntry(
            @Valid @RequestBody CreateTimetableEntryRequest req) {
        User user = SecurityUtils.getCurrentUser();
        return ApiResponse.ok(timetableService.create(req, user.getId()));
    }

    @PutMapping("/entries/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<TimetableEntryResponse> updateEntry(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTimetableEntryRequest req) {
        return ApiResponse.ok(timetableService.update(id, req));
    }

    @DeleteMapping("/entries/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Void> deleteEntry(@PathVariable UUID id) {
        timetableService.delete(id);
        return ApiResponse.ok(null);
    }

    @PostMapping("/entries/generate")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<GenerateTimetableResponse> generateTimetable(
            @Valid @RequestBody GenerateTimetableRequest req) {
        User user = SecurityUtils.getCurrentUser();
        return ApiResponse.ok(timetableService.generate(req, user.getId()));
    }

    @PostMapping("/entries/generate-from-config")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<GenerateTimetableResponse> generateFromConfig(
            @Valid @RequestBody GenerateFromConfigRequest req) {
        User user = SecurityUtils.getCurrentUser();
        return ApiResponse.ok(timetableService.generateFromConfig(req, user.getId()));
    }

    // ─── Classroom subject configs ───────────────────────────────────────────────

    @GetMapping("/configs")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<List<ClassroomSubjectConfigResponse>> getConfigs(
            @RequestParam(required = false) UUID classroomId) {
        return ApiResponse.ok(timetableService.getConfigs(classroomId));
    }

    @PostMapping("/configs")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<ClassroomSubjectConfigResponse> saveConfig(
            @Valid @RequestBody SaveClassroomSubjectConfigRequest req) {
        return ApiResponse.ok(timetableService.saveConfig(req));
    }

    @DeleteMapping("/configs/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<Void> deleteConfig(@PathVariable UUID id) {
        timetableService.deleteConfig(id);
        return ApiResponse.ok(null);
    }

    // ─── My schedule ─────────────────────────────────────────────────────────────

    @GetMapping("/me")
    public ApiResponse<List<TimetableEntryResponse>> getMySchedule(
            @RequestParam String academicYear,
            @RequestParam int semester) {
        User user = SecurityUtils.getCurrentUser();
        return ApiResponse.ok(timetableService.getMySchedule(user.getId(), academicYear, semester));
    }

    // ─── Swap requests ───────────────────────────────────────────────────────────

    @GetMapping("/swaps")
    public ApiResponse<List<SwapRequestResponse>> getMySwaps() {
        User user = SecurityUtils.getCurrentUser();
        return ApiResponse.ok(swapRequestService.getMySwapRequests(user.getId()));
    }

    @PostMapping("/swaps")
    public ApiResponse<SwapRequestResponse> createSwap(
            @Valid @RequestBody CreateSwapRequestDto req) {
        User user = SecurityUtils.getCurrentUser();
        return ApiResponse.ok(swapRequestService.create(user.getId(), req));
    }

    @PostMapping("/swaps/{id}/approve")
    public ApiResponse<SwapRequestResponse> approveSwap(@PathVariable UUID id) {
        User user = SecurityUtils.getCurrentUser();
        return ApiResponse.ok(swapRequestService.approve(id, user.getId()));
    }

    @PostMapping("/swaps/{id}/reject")
    public ApiResponse<SwapRequestResponse> rejectSwap(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewSwapRequestDto req) {
        User user = SecurityUtils.getCurrentUser();
        return ApiResponse.ok(swapRequestService.reject(id, user.getId(), req));
    }

    @DeleteMapping("/swaps/{id}")
    public ApiResponse<Void> cancelSwap(@PathVariable UUID id) {
        User user = SecurityUtils.getCurrentUser();
        swapRequestService.cancel(id, user.getId());
        return ApiResponse.ok(null);
    }
}
