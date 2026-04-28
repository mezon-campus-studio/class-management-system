package com.classroomhub.domain.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "messages", indexes = {
        @Index(name = "idx_messages_conversation", columnList = "conversation_id,created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "conversation_id", nullable = false)
    UUID conversationId;

    @Column(name = "sender_id", nullable = false)
    UUID senderId;

    @Column(columnDefinition = "TEXT")
    String content;

    @Column(name = "reply_to_id")
    UUID replyToId;

    boolean deleted;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false, length = 20)
    @Builder.Default
    Type messageType = Type.TEXT;

    @Column(name = "attachment_url", length = 500)
    String attachmentUrl;

    @Column(name = "attachment_name", length = 255)
    String attachmentName;

    @Column(name = "attachment_type", length = 100)
    String attachmentType;

    @Column(name = "attachment_size")
    Long attachmentSize;

    /** JSON for plugin payloads (POLL → pollId, EVENT → eventId, ...). */
    @Column(name = "payload_json", columnDefinition = "TEXT")
    String payloadJson;

    @Column(nullable = false)
    @Builder.Default
    boolean pinned = false;

    @Column(name = "pinned_at")
    Instant pinnedAt;

    @Column(name = "pinned_by")
    UUID pinnedBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    public enum Type { TEXT, IMAGE, FILE, POLL, EVENT }
}
