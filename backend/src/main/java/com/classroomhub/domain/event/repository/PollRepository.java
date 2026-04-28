package com.classroomhub.domain.event.repository;

import com.classroomhub.domain.event.entity.Poll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PollRepository extends JpaRepository<Poll, UUID> {
    List<Poll> findByClassroomId(UUID classroomId);
    Optional<Poll> findByIdAndClassroomId(UUID id, UUID classroomId);
}
