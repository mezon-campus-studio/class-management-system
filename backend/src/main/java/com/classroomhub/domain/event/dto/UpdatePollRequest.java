package com.classroomhub.domain.event.dto;

import java.time.Instant;

/**
 * Edit poll metadata. Existing votes are preserved.
 *
 * <p>To manually close a poll early, send {@code closeNow=true}; the server
 * snaps {@code closesAt} to the current time. Otherwise pass a new
 * {@code closesAt} (or null to leave it unchanged).</p>
 */
public record UpdatePollRequest(
        String question,
        Instant closesAt,
        Boolean closeNow
) {}
