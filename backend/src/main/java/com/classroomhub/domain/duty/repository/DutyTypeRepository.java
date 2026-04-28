package com.classroomhub.domain.duty.repository;

import com.classroomhub.domain.duty.entity.DutyType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DutyTypeRepository extends JpaRepository<DutyType, UUID> {

    List<DutyType> findByClassroomId(UUID classroomId);

    Optional<DutyType> findByIdAndClassroomId(UUID id, UUID classroomId);
}
