package com.classroomhub.domain.emulation.repository;

import com.classroomhub.domain.emulation.entity.EmulationCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmulationCategoryRepository extends JpaRepository<EmulationCategory, UUID> {

    List<EmulationCategory> findByClassroomId(UUID classroomId);

    Optional<EmulationCategory> findByIdAndClassroomId(UUID id, UUID classroomId);
}
