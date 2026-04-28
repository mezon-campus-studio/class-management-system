package com.classroomhub.domain.chat.dto;

import com.classroomhub.domain.chat.entity.Message;

import java.util.UUID;

public record ReplyPreview(
        UUID id,
        UUID senderId,
        String senderName,
        Message.Type messageType,
        /** Short preview — first ~100 chars of content, or attachment name, or "Bình chọn"/"Sự kiện". */
        String preview,
        boolean deleted
) {}
