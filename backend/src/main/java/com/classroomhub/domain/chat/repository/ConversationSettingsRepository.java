package com.classroomhub.domain.chat.repository;

import com.classroomhub.domain.chat.entity.ConversationSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConversationSettingsRepository extends JpaRepository<ConversationSettings, UUID> {
    Optional<ConversationSettings> findByUserIdAndConversationId(UUID userId, UUID conversationId);
}
