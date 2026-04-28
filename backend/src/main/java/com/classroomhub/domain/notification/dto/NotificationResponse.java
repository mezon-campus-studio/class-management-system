package com.classroomhub.domain.notification.dto;

import com.classroomhub.domain.notification.entity.Notification;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID classroomId,
        Notification.Type type,
        String title,
        String body,
        UUID referenceId,
        boolean read,
        Instant createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getClassroomId(), n.getType(),
                n.getTitle(), n.getBody(), n.getReferenceId(), n.isRead(), n.getCreatedAt());
    }
}
