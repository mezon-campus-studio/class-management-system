package com.classroomhub.domain.chat.dto;

import com.classroomhub.domain.chat.entity.Message;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record SendMessageRequest(
        @Size(max = 4000) String content,
        UUID replyToId,

        /** Defaults to TEXT when omitted. */
        Message.Type messageType,

        /** For IMAGE / FILE messages — set after upload to /attachments. */
        String attachmentUrl,
        String attachmentName,
        String attachmentType,
        Long attachmentSize,

        /** Plugin payload — server-side stored as JSON string. Free-form. */
        Object payload
) {}
