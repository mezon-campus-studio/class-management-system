package com.classroomhub.domain.event.repository;

import com.classroomhub.domain.event.entity.EventRsvp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRsvpRepository extends JpaRepository<EventRsvp, UUID> {
    List<EventRsvp> findByEventId(UUID eventId);
    Optional<EventRsvp> findByEventIdAndUserId(UUID eventId, UUID userId);
}
