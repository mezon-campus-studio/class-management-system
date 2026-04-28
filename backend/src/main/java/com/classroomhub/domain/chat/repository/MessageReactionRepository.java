package com.classroomhub.domain.chat.repository;

import com.classroomhub.domain.chat.entity.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageReactionRepository extends JpaRepository<MessageReaction, MessageReaction.PK> {

    List<MessageReaction> findByMessageId(UUID messageId);

    List<MessageReaction> findByMessageIdIn(List<UUID> messageIds);

    void deleteByMessageIdAndUserIdAndEmoji(UUID messageId, UUID userId, String emoji);

    boolean existsByMessageIdAndUserIdAndEmoji(UUID messageId, UUID userId, String emoji);
}
