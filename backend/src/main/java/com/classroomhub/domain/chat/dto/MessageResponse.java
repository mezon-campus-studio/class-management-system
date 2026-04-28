package com.classroomhub.domain.chat.dto;

import com.classroomhub.domain.chat.entity.Message;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String senderName,
        String senderAvatar,
        String content,
        UUID replyToId,
        ReplyPreview replyToPreview,
        boolean deleted,
        Message.Type messageType,
        String attachmentUrl,
        String attachmentName,
        String attachmentType,
        Long attachmentSize,
        String payloadJson,
        List<ReactionAggregate> reactions,
        boolean pinned,
        Instant pinnedAt,
        UUID pinnedBy,
        Instant createdAt
) {
    public static MessageResponse build(
            Message m, String senderName, String senderAvatar,
            ReplyPreview replyPreview, List<ReactionAggregate> reactions) {
        return new MessageResponse(
                m.getId(), m.getConversationId(), m.getSenderId(),
                senderName, senderAvatar,
                m.isDeleted() ? null : m.getContent(),
                m.getReplyToId(), replyPreview,
                m.isDeleted(),
                m.getMessageType() != null ? m.getMessageType() : Message.Type.TEXT,
                m.isDeleted() ? null : m.getAttachmentUrl(),
                m.isDeleted() ? null : m.getAttachmentName(),
                m.getAttachmentType(),
                m.getAttachmentSize(),
                m.isDeleted() ? null : m.getPayloadJson(),
                reactions != null ? reactions : List.of(),
                m.isPinned(),
                m.getPinnedAt(),
                m.getPinnedBy(),
                m.getCreatedAt());
    }
}
