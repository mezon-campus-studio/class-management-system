package com.classroomhub.domain.chat.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.chat.dto.ConversationResponse;
import com.classroomhub.domain.chat.dto.ConversationSettingsResponse;
import com.classroomhub.domain.chat.dto.MessageResponse;
import com.classroomhub.domain.chat.dto.ReactionAggregate;
import com.classroomhub.domain.chat.dto.ReplyPreview;
import com.classroomhub.domain.chat.dto.SendMessageRequest;
import com.classroomhub.domain.chat.entity.Conversation;
import com.classroomhub.domain.chat.entity.ConversationSettings;
import com.classroomhub.domain.chat.entity.Message;
import com.classroomhub.domain.chat.entity.MessageReaction;
import com.classroomhub.domain.chat.repository.ConversationRepository;
import com.classroomhub.domain.chat.repository.ConversationSettingsRepository;
import com.classroomhub.domain.chat.repository.MessageReactionRepository;
import com.classroomhub.domain.chat.repository.MessageRepository;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.repository.ClassroomMemberRepository;
import com.classroomhub.domain.classroom.service.ClassroomService;
import com.classroomhub.domain.notification.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ConversationSettingsRepository settingsRepository;
    private final MessageRepository messageRepository;
    private final MessageReactionRepository reactionRepository;
    private final ClassroomService classroomService;
    private final UserRepository userRepository;
    private final ClassroomMemberRepository classroomMemberRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final int PREVIEW_LEN = 100;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // ─── Conversations ─────────────────────────────────────────────────────────

    public ConversationResponse getOrCreateClassConversation(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return conversationRepository.findByClassroomId(classroomId).stream()
                .filter(c -> c.getType() == Conversation.Type.CLASS)
                .findFirst()
                .map(ConversationResponse::from)
                .orElseGet(() -> {
                    Conversation c = Conversation.builder()
                            .classroomId(classroomId)
                            .type(Conversation.Type.CLASS)
                            .name("Lớp học")
                            .build();
                    return ConversationResponse.from(conversationRepository.save(c));
                });
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> listConversations(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return conversationRepository.findByClassroomId(classroomId)
                .stream().map(ConversationResponse::from).toList();
    }

    // ─── Messages ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessages(UUID classroomId, UUID conversationId, int page, int size, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        conversationRepository.findByIdAndClassroomId(conversationId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONVERSATION_NOT_FOUND));
        Page<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(
                conversationId, PageRequest.of(page, size));
        Context ctx = buildContext(messages.getContent(), userId);
        return messages.map(m -> toResponse(m, ctx));
    }

    /** Returns the 0-based descending page number that contains the given message,
     *  given the requested page size. The page is calculated by counting non-deleted
     *  messages newer than the target, then dividing by the page size. */
    @Transactional(readOnly = true)
    public int getMessagePageNumber(UUID classroomId, UUID conversationId, UUID messageId, int size, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        conversationRepository.findByIdAndClassroomId(conversationId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONVERSATION_NOT_FOUND));
        Message msg = messageRepository.findById(messageId)
                .filter(m -> m.getConversationId().equals(conversationId))
                .orElseThrow(() -> new BusinessException(ErrorCode.MESSAGE_NOT_FOUND));
        long newerCount = messageRepository.countNewerNonDeletedThan(conversationId, msg.getCreatedAt());
        return (int) (newerCount / size);
    }

    public record MessagePageInfo(int pageNumber) {}

    @Transactional(readOnly = true)
    public List<MessageResponse> getPinnedMessages(UUID classroomId, UUID conversationId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        conversationRepository.findByIdAndClassroomId(conversationId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONVERSATION_NOT_FOUND));
        List<Message> pinned = messageRepository.findByConversationIdAndPinnedTrueOrderByPinnedAtDesc(conversationId);
        Context ctx = buildContext(pinned, userId);
        return pinned.stream().map(m -> toResponse(m, ctx)).toList();
    }

    public MessageResponse sendMessage(UUID classroomId, UUID conversationId, SendMessageRequest req, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        conversationRepository.findByIdAndClassroomId(conversationId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Validate reply target if present
        if (req.replyToId() != null) {
            Message target = messageRepository.findById(req.replyToId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.MESSAGE_NOT_FOUND));
            if (!target.getConversationId().equals(conversationId)) {
                throw new BusinessException(ErrorCode.MESSAGE_NOT_FOUND);
            }
        }

        Message.Type type = req.messageType() != null ? req.messageType() : Message.Type.TEXT;
        validate(type, req);

        String payloadJson = null;
        if (req.payload() != null) {
            try { payloadJson = objectMapper.writeValueAsString(req.payload()); }
            catch (Exception ex) { throw new BusinessException(ErrorCode.VALIDATION_ERROR); }
        }

        Message message = Message.builder()
                .conversationId(conversationId)
                .senderId(userId)
                .content(req.content())
                .replyToId(req.replyToId())
                .deleted(false)
                .messageType(type)
                .attachmentUrl(req.attachmentUrl())
                .attachmentName(req.attachmentName())
                .attachmentType(req.attachmentType())
                .attachmentSize(req.attachmentSize())
                .payloadJson(payloadJson)
                .build();
        message = messageRepository.save(message);

        MessageResponse result = broadcast(message, userId, classroomId);

        // Publish lightweight notification for in-app banner
        User sender = userRepository.findById(userId).orElse(null);
        String senderName = sender != null ? sender.getDisplayName() : "Người dùng";
        String preview = previewOf(message);

        // Resolve mentioned users (TEXT messages only)
        List<UUID> mentionedUserIds = new ArrayList<>();
        if (message.getMessageType() == Message.Type.TEXT && message.getContent() != null) {
            String content = message.getContent();
            List<ClassroomMember> members = classroomMemberRepository.findAllByClassroomId(classroomId);
            List<UUID> memberUserIds = members.stream().map(ClassroomMember::getUserId).toList();
            userRepository.findAllById(memberUserIds).forEach(u -> {
                if (u.getDisplayName() != null
                        && content.contains("@" + u.getDisplayName())
                        && !u.getId().equals(userId)) {
                    mentionedUserIds.add(u.getId());
                }
            });
        }

        messagingTemplate.convertAndSend(
                "/topic/classrooms/" + classroomId + "/chat",
                new ChatNotify(conversationId, classroomId, senderName, preview, mentionedUserIds)
        );

        // Notify members based on their chat notification preference
        notificationService.sendChatNotifications(
                classroomId, userId, senderName, preview, message.getId(), mentionedUserIds);

        return result;
    }

    public void deleteMessage(UUID classroomId, UUID conversationId, UUID messageId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Message msg = requireMessage(messageId, conversationId);
        if (!msg.getSenderId().equals(userId)) {
            classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.MONITOR);
        }
        msg.setDeleted(true);
        // Deleting a pinned message also unpins it
        if (msg.isPinned()) {
            msg.setPinned(false);
            msg.setPinnedAt(null);
            msg.setPinnedBy(null);
        }
        messageRepository.save(msg);
        broadcast(msg, userId, classroomId);
    }

    // ─── Pin / Unpin ───────────────────────────────────────────────────────────

    public MessageResponse pinMessage(UUID classroomId, UUID conversationId, UUID messageId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Message msg = requireMessage(messageId, conversationId);
        if (msg.isDeleted()) throw new BusinessException(ErrorCode.MESSAGE_NOT_FOUND);

        // Sender or MONITOR+ can pin
        if (!msg.getSenderId().equals(userId)) {
            classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.MONITOR);
        }
        if (!msg.isPinned()) {
            msg.setPinned(true);
            msg.setPinnedAt(Instant.now());
            msg.setPinnedBy(userId);
            messageRepository.save(msg);
        }
        return broadcast(msg, userId, classroomId);
    }

    public MessageResponse unpinMessage(UUID classroomId, UUID conversationId, UUID messageId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Message msg = requireMessage(messageId, conversationId);

        if (!msg.getSenderId().equals(userId) && !userId.equals(msg.getPinnedBy())) {
            classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.MONITOR);
        }
        if (msg.isPinned()) {
            msg.setPinned(false);
            msg.setPinnedAt(null);
            msg.setPinnedBy(null);
            messageRepository.save(msg);
        }
        return broadcast(msg, userId, classroomId);
    }

    // ─── Reactions ─────────────────────────────────────────────────────────────

    public MessageResponse addReaction(UUID classroomId, UUID conversationId, UUID messageId,
                                       String emoji, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Message msg = requireMessage(messageId, conversationId);
        if (msg.isDeleted()) throw new BusinessException(ErrorCode.MESSAGE_NOT_FOUND);
        String e = sanitizeEmoji(emoji);

        boolean isNew = !reactionRepository.existsByMessageIdAndUserIdAndEmoji(messageId, userId, e);
        if (isNew) {
            reactionRepository.save(MessageReaction.builder()
                    .messageId(messageId).userId(userId).emoji(e).createdAt(Instant.now()).build());

            // Notify the message author (skip if reacting to own message)
            if (!msg.getSenderId().equals(userId)) {
                User reactor = userRepository.findById(userId).orElse(null);
                String reactorName = reactor != null ? reactor.getDisplayName() : "Ai đó";
                notificationService.send(
                        msg.getSenderId(), classroomId,
                        com.classroomhub.domain.notification.entity.Notification.Type.MESSAGE_REACTION,
                        reactorName + " đã thả cảm xúc vào tin nhắn của bạn",
                        e + " — " + previewOf(msg),
                        messageId);
            }
        }
        return broadcast(msg, userId, classroomId);
    }

    public MessageResponse removeReaction(UUID classroomId, UUID conversationId, UUID messageId,
                                          String emoji, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Message msg = requireMessage(messageId, conversationId);
        String e = sanitizeEmoji(emoji);
        reactionRepository.deleteByMessageIdAndUserIdAndEmoji(messageId, userId, e);
        return broadcast(msg, userId, classroomId);
    }

    // ─── Attachments ───────────────────────────────────────────────────────────

    private static final DateTimeFormatter YEAR_MONTH_FMT =
            DateTimeFormatter.ofPattern("yyyyMM").withZone(ZoneId.systemDefault());

    public ChatAttachment uploadAttachment(UUID classroomId, UUID conversationId, MultipartFile file, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        conversationRepository.findByIdAndClassroomId(conversationId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONVERSATION_NOT_FOUND));
        try {
            String yearMonth = YEAR_MONTH_FMT.format(Instant.now());
            Path dir = Paths.get(uploadDir, "chat", classroomId.toString(), yearMonth);
            Files.createDirectories(dir);

            // Sanitize original filename
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String sanitized = originalName.replaceAll("[^a-zA-Z0-9._\\-]", "_");

            // actualFile stored on disk: {UUID}_{sanitizedFilename}
            String actualFile = UUID.randomUUID() + "_" + sanitized;
            // storedName used in URL: {yyyyMM}-{actualFile}
            String storedName = yearMonth + "-" + actualFile;

            Path dest = dir.resolve(actualFile);
            file.transferTo(dest);

            String relativeUrl = "/api/v1/classrooms/" + classroomId
                    + "/chat/conversations/" + conversationId
                    + "/attachments/" + storedName;
            return new ChatAttachment(relativeUrl, originalName,
                    file.getContentType(), file.getSize());
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.UPLOAD_FAILED);
        }
    }

    @Transactional(readOnly = true)
    public Path resolveAttachment(UUID classroomId, UUID conversationId, String storedName, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        conversationRepository.findByIdAndClassroomId(conversationId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONVERSATION_NOT_FOUND));

        Path file;
        Path base;
        // New format: starts with 6 digits followed by '-' (e.g. 202504-{uuid}_{name})
        if (storedName.length() > 7 && storedName.substring(0, 6).matches("\\d{6}") && storedName.charAt(6) == '-') {
            String yearMonth = storedName.substring(0, 6);
            String actualFile = storedName.substring(7); // strip "yyyyMM-"
            file = Paths.get(uploadDir, "chat", classroomId.toString(), yearMonth, actualFile).normalize();
            base = Paths.get(uploadDir, "chat", classroomId.toString(), yearMonth).normalize().toAbsolutePath();
        } else {
            // Old flat format
            file = Paths.get(uploadDir, "chat", classroomId.toString(), storedName).normalize();
            base = Paths.get(uploadDir, "chat", classroomId.toString()).normalize().toAbsolutePath();
        }

        if (!file.toAbsolutePath().startsWith(base) || !Files.exists(file)) {
            throw new BusinessException(ErrorCode.DOCUMENT_NOT_FOUND);
        }
        return file;
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private Message requireMessage(UUID messageId, UUID conversationId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MESSAGE_NOT_FOUND));
        if (!msg.getConversationId().equals(conversationId)) {
            throw new BusinessException(ErrorCode.MESSAGE_NOT_FOUND);
        }
        return msg;
    }

    private void validate(Message.Type type, SendMessageRequest req) {
        switch (type) {
            case TEXT -> {
                if (req.content() == null || req.content().isBlank()) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR);
                }
            }
            case IMAGE, FILE -> {
                if (req.attachmentUrl() == null || req.attachmentUrl().isBlank()) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR);
                }
            }
            case POLL, EVENT -> {
                if (req.payload() == null) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR);
                }
            }
        }
    }

    private static String sanitizeEmoji(String emoji) {
        if (emoji == null || emoji.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        String trimmed = emoji.trim();
        if (trimmed.length() > 16) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        return trimmed;
    }

    /** Single-message broadcast — re-resolves sender/reactions/replyPreview for the recipient view. */
    private MessageResponse broadcast(Message msg, UUID viewerId, UUID classroomId) {
        Context ctx = buildContext(List.of(msg), viewerId);
        MessageResponse res = toResponse(msg, ctx);
        messagingTemplate.convertAndSend("/topic/conversations/" + msg.getConversationId(), res);
        return res;
    }

    public record ChatNotify(UUID conversationId, UUID classroomId, String senderName, String preview, List<UUID> mentionedUserIds) {}

    /** Shared context for batch-resolving senders / reply previews / reactions. */
    private record Context(
            Map<UUID, User> users,
            Map<UUID, Message> repliedTargets,
            Map<UUID, List<MessageReaction>> reactionsByMessage,
            UUID viewerId
    ) {}

    private Context buildContext(List<Message> messages, UUID viewerId) {
        if (messages.isEmpty()) {
            return new Context(Map.of(), Map.of(), Map.of(), viewerId);
        }

        // Collect user ids: senders + pinnedBy
        List<UUID> userIds = new ArrayList<>();
        messages.forEach(m -> {
            userIds.add(m.getSenderId());
            if (m.getPinnedBy() != null) userIds.add(m.getPinnedBy());
        });

        // Collect reply target ids
        List<UUID> replyIds = messages.stream().map(Message::getReplyToId).filter(java.util.Objects::nonNull).distinct().toList();
        Map<UUID, Message> repliedTargets = new HashMap<>();
        if (!replyIds.isEmpty()) {
            messageRepository.findAllById(replyIds).forEach(t -> {
                repliedTargets.put(t.getId(), t);
                userIds.add(t.getSenderId());
            });
        }

        Map<UUID, User> users = new HashMap<>();
        userRepository.findAllById(userIds.stream().distinct().toList())
                .forEach(u -> users.put(u.getId(), u));

        // Reactions: batch fetch and group by messageId
        Map<UUID, List<MessageReaction>> reactionsByMessage = new HashMap<>();
        List<UUID> messageIds = messages.stream().map(Message::getId).toList();
        if (!messageIds.isEmpty()) {
            for (MessageReaction r : reactionRepository.findByMessageIdIn(messageIds)) {
                reactionsByMessage.computeIfAbsent(r.getMessageId(), k -> new ArrayList<>()).add(r);
            }
        }

        return new Context(users, repliedTargets, reactionsByMessage, viewerId);
    }

    private MessageResponse toResponse(Message m, Context ctx) {
        User sender = ctx.users().get(m.getSenderId());
        ReplyPreview replyPreview = null;
        if (m.getReplyToId() != null) {
            Message target = ctx.repliedTargets().get(m.getReplyToId());
            if (target != null) {
                User targetSender = ctx.users().get(target.getSenderId());
                replyPreview = new ReplyPreview(
                        target.getId(),
                        target.getSenderId(),
                        targetSender != null ? targetSender.getDisplayName() : null,
                        target.getMessageType() != null ? target.getMessageType() : Message.Type.TEXT,
                        previewOf(target),
                        target.isDeleted());
            }
        }
        List<ReactionAggregate> reactions = aggregate(ctx.reactionsByMessage().get(m.getId()), ctx.viewerId());
        return MessageResponse.build(m,
                sender != null ? sender.getDisplayName() : null,
                sender != null ? sender.getAvatarUrl() : null,
                replyPreview, reactions);
    }

    private static String previewOf(Message m) {
        if (m.isDeleted()) return "Tin nhắn đã bị xóa";
        return switch (m.getMessageType() != null ? m.getMessageType() : Message.Type.TEXT) {
            case TEXT  -> truncate(m.getContent(), PREVIEW_LEN);
            case IMAGE -> "🖼 " + (m.getAttachmentName() != null ? m.getAttachmentName() : "Hình ảnh");
            case FILE  -> "📎 " + (m.getAttachmentName() != null ? m.getAttachmentName() : "Tệp đính kèm");
            case POLL  -> "📊 Bình chọn";
            case EVENT -> "📅 Sự kiện";
        };
    }

    private static String truncate(String s, int n) {
        if (s == null) return "";
        return s.length() <= n ? s : s.substring(0, n) + "…";
    }

    private static List<ReactionAggregate> aggregate(List<MessageReaction> raw, UUID viewerId) {
        if (raw == null || raw.isEmpty()) return List.of();
        // Preserve insertion-by-emoji order; track count + voter list per emoji.
        Map<String, List<UUID>> votersByEmoji = new LinkedHashMap<>();
        Map<String, Boolean> mine = new HashMap<>();
        for (MessageReaction r : raw) {
            votersByEmoji.computeIfAbsent(r.getEmoji(), k -> new ArrayList<>()).add(r.getUserId());
            if (viewerId != null && viewerId.equals(r.getUserId())) {
                mine.put(r.getEmoji(), true);
            }
        }
        List<ReactionAggregate> out = new ArrayList<>(votersByEmoji.size());
        for (Map.Entry<String, List<UUID>> e : votersByEmoji.entrySet()) {
            out.add(new ReactionAggregate(
                    e.getKey(),
                    e.getValue().size(),
                    mine.getOrDefault(e.getKey(), false),
                    List.copyOf(e.getValue())
            ));
        }
        return out;
    }

    public record ChatAttachment(String url, String name, String contentType, long size) {}

    // ─── Conversation settings ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ConversationSettingsResponse getSettings(UUID classroomId, UUID conversationId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        conversationRepository.findByIdAndClassroomId(conversationId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONVERSATION_NOT_FOUND));
        return settingsRepository.findByUserIdAndConversationId(userId, conversationId)
                .map(ConversationSettingsResponse::from)
                .orElse(ConversationSettingsResponse.empty());
    }

    public ConversationSettingsResponse saveSettings(UUID classroomId, UUID conversationId, UUID userId,
                                                     String bubbleColor, String wallpaper) {
        classroomService.requireMember(classroomId, userId);
        conversationRepository.findByIdAndClassroomId(conversationId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONVERSATION_NOT_FOUND));
        ConversationSettings settings = settingsRepository
                .findByUserIdAndConversationId(userId, conversationId)
                .orElseGet(() -> ConversationSettings.builder()
                        .userId(userId)
                        .conversationId(conversationId)
                        .build());
        settings.setBubbleColor(bubbleColor);
        settings.setWallpaper(wallpaper);
        return ConversationSettingsResponse.from(settingsRepository.save(settings));
    }
}
