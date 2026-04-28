package com.classroomhub.domain.fund.repository;

import com.classroomhub.domain.fund.entity.Fund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FundRepository extends JpaRepository<Fund, UUID> {
    Optional<Fund> findByClassroomId(UUID classroomId);
}
