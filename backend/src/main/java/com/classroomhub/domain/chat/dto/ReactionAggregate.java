package com.classroomhub.domain.chat.dto;

import java.util.List;
import java.util.UUID;

public record ReactionAggregate(
        String emoji,
        int count,
        boolean reactedByMe,
        /** User IDs that reacted with this emoji, in reaction order. */
        List<UUID> userIds
) {}
