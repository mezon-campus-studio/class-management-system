package com.classroomhub.domain.event.dto;

import com.classroomhub.domain.event.entity.EventRsvp;
import jakarta.validation.constraints.NotNull;

public record RsvpRequest(
        @NotNull EventRsvp.Response response,
        String note
) {}
