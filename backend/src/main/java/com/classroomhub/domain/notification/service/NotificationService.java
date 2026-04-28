package com.classroomhub.domain.notification.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.classroom.repository.ClassroomMemberRepository;
import com.classroomhub.domain.notification.dto.NotificationResponse;
import com.classroomhub.domain.notification.entity.Notification;
import com.classroomhub.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.classroomhub.domain.notification.entity.NotificationPreference;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationPreferenceService preferenceService;
    private final ClassroomMemberRepository classroomMemberRepository;

    public Notification create(UUID userId, UUID classroomId, Notification.Type type,
                               String title, String body, UUID referenceId) {
        return notificationRepository.save(Notification.builder()
                .userId(userId)
                .classroomId(classroomId)
                .type(type)
                .title(title)
                .body(body)
                .referenceId(referenceId)
                .read(false)
                .build());
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> list(UUID userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(page, size)).map(NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public long countUnread(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markRead(UUID userId, UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));
        if (!n.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    public void markAllRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    @Async
    @Transactional
    public void send(UUID userId, UUID classroomId, Notification.Type type,
                     String title, String body, UUID referenceId) {
        if (!preferenceService.isEnabled(userId, classroomId, type)) return;
        Notification n = create(userId, classroomId, type, title, body, referenceId);
        try {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(), "/queue/notifications", NotificationResponse.from(n));
        } catch (Exception ignored) {}
    }

    @Async
    @Transactional
    public void sendToClassroomMembers(UUID classroomId, UUID excludeUserId,
                                       Notification.Type type, String title, String body, UUID referenceId) {
        classroomMemberRepository.findAllByClassroomId(classroomId).forEach(m -> {
            if (m.getUserId().equals(excludeUserId)) return;
            if (!preferenceService.isEnabled(m.getUserId(), classroomId, type)) return;
            Notification n = create(m.getUserId(), classroomId, type, title, body, referenceId);
            try {
                messagingTemplate.convertAndSendToUser(
                        m.getUserId().toString(), "/queue/notifications", NotificationResponse.from(n));
            } catch (Exception ignored) {}
        });
    }

    @Async
    @Transactional
    public void sendChatNotifications(UUID classroomId, UUID senderId, String senderName,
                                      String preview, UUID messageId, List<UUID> mentionedUserIds) {
        classroomMemberRepository.findAllByClassroomId(classroomId).forEach(m -> {
            if (m.getUserId().equals(senderId)) return;
            NotificationPreference.ChatLevel level =
                    preferenceService.getChatLevel(m.getUserId(), classroomId);
            if (level == NotificationPreference.ChatLevel.NOTHING) return;

            boolean mentioned = mentionedUserIds.contains(m.getUserId());
            if (level == NotificationPreference.ChatLevel.MENTIONS_ONLY && !mentioned) return;

            Notification.Type type = mentioned
                    ? Notification.Type.MESSAGE_MENTION
                    : Notification.Type.MESSAGE_RECEIVED;
            String title = mentioned
                    ? senderName + " đã nhắc đến bạn"
                    : "Tin nhắn mới từ " + senderName;

            Notification n = create(m.getUserId(), classroomId, type, title, preview, messageId);
            try {
                messagingTemplate.convertAndSendToUser(
                        m.getUserId().toString(), "/queue/notifications", NotificationResponse.from(n));
            } catch (Exception ignored) {}
        });
    }
}
