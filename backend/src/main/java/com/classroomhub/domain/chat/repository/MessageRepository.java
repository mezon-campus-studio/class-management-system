package com.classroomhub.domain.chat.repository;

import com.classroomhub.domain.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByConversationIdOrderByCreatedAtDesc(UUID conversationId, Pageable pageable);
    List<Message> findByConversationIdAndPinnedTrueOrderByPinnedAtDesc(UUID conversationId);

    /** Count non-deleted messages in the conversation that are newer than the given timestamp.
     *  Used to calculate which descending page a specific message sits on. */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversationId = :convId AND m.createdAt > :after AND m.deleted = false")
    long countNewerNonDeletedThan(@Param("convId") UUID convId, @Param("after") Instant after);
}
