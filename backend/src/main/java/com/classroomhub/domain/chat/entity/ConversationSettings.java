package com.classroomhub.domain.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "conversation_settings",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "conversation_id"})
)
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "user_id", nullable = false)
    UUID userId;

    @Column(name = "conversation_id", nullable = false)
    UUID conversationId;

    @Column(name = "bubble_color", length = 100)
    String bubbleColor;

    @Column(length = 500)
    String wallpaper;

    @LastModifiedDate
    @Column(name = "updated_at")
    Instant updatedAt;
}
