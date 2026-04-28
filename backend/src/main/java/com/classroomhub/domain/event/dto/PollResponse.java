package com.classroomhub.domain.event.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PollResponse(
        UUID id,
        String question,
        boolean multiChoice,
        boolean anonymous,
        Instant closesAt,
        boolean isOpen,
        List<PollOptionResponse> options,
        UUID createdById,
        /** Option IDs the requesting user has currently voted for. */
        List<UUID> myOptionIds
) {}
