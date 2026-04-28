package com.classroomhub.domain.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "user_id", nullable = false)
    UUID userId;

    @Column(name = "classroom_id")
    UUID classroomId;

    @Enumerated(EnumType.STRING)
    @Column(name = "chat_level", length = 20, nullable = false)
    @Builder.Default
    ChatLevel chatLevel = ChatLevel.ALL;

    @Builder.Default
    @Column(name = "duty_enabled")
    boolean dutyEnabled = true;

    @Builder.Default
    @Column(name = "event_enabled")
    boolean eventEnabled = true;

    @Builder.Default
    @Column(name = "attendance_enabled")
    boolean attendanceEnabled = true;

    @Builder.Default
    @Column(name = "fund_enabled")
    boolean fundEnabled = true;

    @Builder.Default
    @Column(name = "evaluation_enabled")
    boolean evaluationEnabled = true;

    public enum ChatLevel {
        ALL, MENTIONS_ONLY, NOTHING
    }
}
