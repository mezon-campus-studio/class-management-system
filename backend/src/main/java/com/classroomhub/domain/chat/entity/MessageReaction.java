package com.classroomhub.domain.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "message_reactions", indexes = {
        @Index(name = "idx_reactions_message", columnList = "message_id")
})
@IdClass(MessageReaction.PK.class)
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageReaction {

    @Id
    @Column(name = "message_id", nullable = false)
    UUID messageId;

    @Id
    @Column(name = "user_id", nullable = false)
    UUID userId;

    @Id
    @Column(nullable = false, length = 16)
    String emoji;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    Instant createdAt = Instant.now();

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class PK implements Serializable {
        private UUID messageId;
        private UUID userId;
        private String emoji;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof PK pk)) return false;
            return Objects.equals(messageId, pk.messageId)
                    && Objects.equals(userId, pk.userId)
                    && Objects.equals(emoji, pk.emoji);
        }

        @Override
        public int hashCode() { return Objects.hash(messageId, userId, emoji); }
    }
}
