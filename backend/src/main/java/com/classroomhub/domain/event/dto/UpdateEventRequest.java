package com.classroomhub.domain.event.dto;

import java.time.Instant;

/**
 * Edit an existing event. Any null field is left unchanged. Pass an empty
 * string for {@code description} or {@code location} to clear them.
 */
public record UpdateEventRequest(
        String title,
        String description,
        Instant startTime,
        Instant endTime,
        String location,
        Boolean mandatory
) {}
