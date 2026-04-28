package com.classroomhub.domain.duty.repository;

import com.classroomhub.domain.duty.entity.DutyAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DutyAssignmentRepository extends JpaRepository<DutyAssignment, UUID> {

    List<DutyAssignment> findByClassroomId(UUID classroomId);

    List<DutyAssignment> findByClassroomIdAndDutyDate(UUID classroomId, LocalDate date);

    List<DutyAssignment> findByClassroomIdAndAssignedToId(UUID classroomId, UUID assignedToId);

    List<DutyAssignment> findByDutyDateAndStatus(LocalDate dutyDate, DutyAssignment.Status status);
}
