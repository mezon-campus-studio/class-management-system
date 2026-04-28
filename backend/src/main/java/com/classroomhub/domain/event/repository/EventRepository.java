package com.classroomhub.domain.event.repository;

import com.classroomhub.domain.event.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    Page<Event> findByClassroomIdOrderByStartTimeDesc(UUID classroomId, Pageable pageable);
    Optional<Event> findByIdAndClassroomId(UUID id, UUID classroomId);
    List<Event> findByStartTimeBetween(Instant from, Instant to);
}
