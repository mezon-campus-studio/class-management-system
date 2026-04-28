package com.classroomhub.domain.chat.repository;

import com.classroomhub.domain.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByConversationIdOrderByCreatedAtDesc(UUID conversationId, Pageable pageable);
    List<Message> findByConversationIdAndPinnedTrueOrderByPinnedAtDesc(UUID conversationId);
}
