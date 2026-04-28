package com.classroomhub.domain.event.dto;

import java.util.List;
import java.util.UUID;

public record PollOptionResponse(
        UUID id,
        String text,
        long voteCount,
        /** User IDs of voters; always empty for anonymous polls. */
        List<UUID> voterIds
) {}
