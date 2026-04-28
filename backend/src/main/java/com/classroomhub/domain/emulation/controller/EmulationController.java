package com.classroomhub.domain.emulation.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.emulation.dto.*;
import com.classroomhub.domain.emulation.service.EmulationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms/{classroomId}/emulation")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class EmulationController {

    private final EmulationService emulationService;

    // ─── Categories ──────────────────────────────────────────────────────────────

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CategoryResponse> createCategory(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreateCategoryRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(emulationService.createCategory(classroomId, req, userId));
    }

    @GetMapping("/categories")
    public ApiResponse<List<CategoryResponse>> listCategories(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(emulationService.listCategories(classroomId, userId));
    }

    @PutMapping("/categories/{categoryId}")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable UUID classroomId,
            @PathVariable UUID categoryId,
            @RequestBody UpdateCategoryRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(emulationService.updateCategory(classroomId, categoryId, req, userId));
    }

    @DeleteMapping("/categories/{categoryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(
            @PathVariable UUID classroomId,
            @PathVariable UUID categoryId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        emulationService.deleteCategory(classroomId, categoryId, userId);
    }

    // ─── Entries ─────────────────────────────────────────────────────────────────

    @PostMapping("/entries")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EntryResponse> addEntry(
            @PathVariable UUID classroomId,
            @Valid @RequestBody AddEntryRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(emulationService.addEntry(classroomId, req, userId));
    }

    @GetMapping("/entries")
    public ApiResponse<List<EntryResponse>> listEntries(
            @PathVariable UUID classroomId,
            @RequestParam(required = false) UUID memberId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        if (memberId != null) {
            return ApiResponse.ok(emulationService.listEntriesByMember(classroomId, memberId, userId));
        }
        return ApiResponse.ok(emulationService.listEntries(classroomId, userId));
    }

    @PutMapping("/entries/{entryId}")
    public ApiResponse<EntryResponse> updateEntry(
            @PathVariable UUID classroomId,
            @PathVariable UUID entryId,
            @RequestBody UpdateEntryRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(emulationService.updateEntry(classroomId, entryId, req, userId));
    }

    @DeleteMapping("/entries/{entryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEntry(
            @PathVariable UUID classroomId,
            @PathVariable UUID entryId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        emulationService.deleteEntry(classroomId, entryId, userId);
    }

    // ─── Summary ─────────────────────────────────────────────────────────────────

    @GetMapping("/summary")
    public ApiResponse<List<MemberScoreSummary>> getScoreSummary(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(emulationService.getScoreSummary(classroomId, userId));
    }
}
