package com.classroomhub.domain.timetable.repository;

import com.classroomhub.domain.timetable.entity.SwapRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SwapRequestRepository extends JpaRepository<SwapRequest, UUID> {

    List<SwapRequest> findByRequesterIdOrderByCreatedAtDesc(UUID requesterId);

    List<SwapRequest> findByTargetTeacherIdOrderByCreatedAtDesc(UUID targetTeacherId);

    List<SwapRequest> findByRequesterIdOrTargetTeacherIdOrderByCreatedAtDesc(UUID requesterId, UUID targetTeacherId);

    Optional<SwapRequest> findByIdAndRequesterId(UUID id, UUID requesterId);

    boolean existsByRequesterEntryIdAndStatus(UUID requesterEntryId, SwapRequest.Status status);
}
