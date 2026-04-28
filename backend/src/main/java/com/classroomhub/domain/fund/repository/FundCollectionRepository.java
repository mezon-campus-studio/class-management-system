package com.classroomhub.domain.fund.repository;

import com.classroomhub.domain.fund.entity.FundCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FundCollectionRepository extends JpaRepository<FundCollection, UUID> {
    List<FundCollection> findByClassroomId(UUID classroomId);
    Optional<FundCollection> findByIdAndClassroomId(UUID id, UUID classroomId);
}
