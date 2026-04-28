package com.classroomhub.domain.chat.repository;

import com.classroomhub.domain.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findByClassroomId(UUID classroomId);
    Optional<Conversation> findByIdAndClassroomId(UUID id, UUID classroomId);
}
