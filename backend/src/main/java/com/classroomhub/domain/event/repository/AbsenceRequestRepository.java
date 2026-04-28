package com.classroomhub.domain.event.repository;

import com.classroomhub.domain.event.entity.AbsenceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AbsenceRequestRepository extends JpaRepository<AbsenceRequest, UUID> {
    List<AbsenceRequest> findByClassroomId(UUID classroomId);
    List<AbsenceRequest> findByClassroomIdAndUserId(UUID classroomId, UUID userId);
    List<AbsenceRequest> findByClassroomIdAndStatus(UUID classroomId, AbsenceRequest.Status status);
}
