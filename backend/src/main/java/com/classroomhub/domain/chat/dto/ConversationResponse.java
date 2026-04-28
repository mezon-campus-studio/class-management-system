package com.classroomhub.domain.chat.dto;

import com.classroomhub.domain.chat.entity.Conversation;

import java.time.Instant;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        UUID classroomId,
        Conversation.Type type,
        String name,
        Instant createdAt
) {
    public static ConversationResponse from(Conversation c) {
        return new ConversationResponse(c.getId(), c.getClassroomId(), c.getType(), c.getName(), c.getCreatedAt());
    }
}
