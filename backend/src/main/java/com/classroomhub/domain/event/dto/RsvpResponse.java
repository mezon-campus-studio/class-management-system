package com.classroomhub.domain.event.dto;

import com.classroomhub.domain.event.entity.EventRsvp;

import java.util.UUID;

public record RsvpResponse(
        UUID id,
        UUID eventId,
        UUID userId,
        EventRsvp.Response response,
        String note
) {}
