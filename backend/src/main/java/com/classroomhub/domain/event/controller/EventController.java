package com.classroomhub.domain.event.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.event.dto.*;
import com.classroomhub.domain.event.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms/{classroomId}/events")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class EventController {

    private final EventService eventService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EventResponse> createEvent(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreateEventRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.createEvent(classroomId, req, userId));
    }

    @GetMapping
    public ApiResponse<Page<EventResponse>> listEvents(
            @PathVariable UUID classroomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.listEvents(classroomId, userId, page, Math.min(size, 50)));
    }

    @GetMapping("/{eventId}")
    public ApiResponse<EventResponse> getEvent(
            @PathVariable UUID classroomId,
            @PathVariable UUID eventId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.getEvent(classroomId, eventId, userId));
    }

    @PutMapping("/{eventId}")
    public ApiResponse<EventResponse> updateEvent(
            @PathVariable UUID classroomId,
            @PathVariable UUID eventId,
            @RequestBody UpdateEventRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.updateEvent(classroomId, eventId, req, userId));
    }

    @DeleteMapping("/{eventId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            @PathVariable UUID classroomId,
            @PathVariable UUID eventId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        eventService.deleteEvent(classroomId, eventId, userId);
    }

    @PostMapping("/{eventId}/rsvp")
    public ApiResponse<RsvpResponse> rsvp(
            @PathVariable UUID classroomId,
            @PathVariable UUID eventId,
            @Valid @RequestBody RsvpRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.rsvp(classroomId, eventId, req, userId));
    }

    @GetMapping("/{eventId}/rsvps")
    public ApiResponse<List<RsvpResponse>> listRsvps(
            @PathVariable UUID classroomId,
            @PathVariable UUID eventId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.listRsvps(classroomId, eventId, userId));
    }

    @PostMapping("/absence-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AbsenceRequestResponse> createAbsenceRequest(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreateAbsenceRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.createAbsenceRequest(classroomId, req, userId));
    }

    @GetMapping("/absence-requests")
    public ApiResponse<List<AbsenceRequestResponse>> listAbsenceRequests(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.listAbsenceRequests(classroomId, userId));
    }

    @PutMapping("/absence-requests/{requestId}/review")
    public ApiResponse<AbsenceRequestResponse> reviewAbsenceRequest(
            @PathVariable UUID classroomId,
            @PathVariable UUID requestId,
            @Valid @RequestBody ReviewAbsenceRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.reviewAbsenceRequest(classroomId, requestId, req, userId));
    }

    @PostMapping("/polls")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PollResponse> createPoll(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreatePollRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.createPoll(classroomId, req, userId));
    }

    @GetMapping("/polls")
    public ApiResponse<List<PollResponse>> listPolls(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.listPolls(classroomId, userId));
    }

    @GetMapping("/polls/{pollId}")
    public ApiResponse<PollResponse> getPoll(
            @PathVariable UUID classroomId,
            @PathVariable UUID pollId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.getPoll(classroomId, pollId, userId));
    }

    @PostMapping("/polls/{pollId}/vote")
    public ApiResponse<PollResponse> vote(
            @PathVariable UUID classroomId,
            @PathVariable UUID pollId,
            @Valid @RequestBody VoteRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.vote(classroomId, pollId, req, userId));
    }

    @PutMapping("/polls/{pollId}")
    public ApiResponse<PollResponse> updatePoll(
            @PathVariable UUID classroomId,
            @PathVariable UUID pollId,
            @RequestBody UpdatePollRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(eventService.updatePoll(classroomId, pollId, req, userId));
    }

    @DeleteMapping("/polls/{pollId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePoll(
            @PathVariable UUID classroomId,
            @PathVariable UUID pollId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        eventService.deletePoll(classroomId, pollId, userId);
    }

    @DeleteMapping("/absence-requests/{requestId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelAbsenceRequest(
            @PathVariable UUID classroomId,
            @PathVariable UUID requestId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        eventService.cancelAbsenceRequest(classroomId, requestId, userId);
    }
}
