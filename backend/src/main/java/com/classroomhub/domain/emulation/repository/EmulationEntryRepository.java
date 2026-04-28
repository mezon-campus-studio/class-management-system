package com.classroomhub.domain.emulation.repository;

import com.classroomhub.domain.emulation.entity.EmulationEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface EmulationEntryRepository extends JpaRepository<EmulationEntry, UUID> {

    List<EmulationEntry> findByClassroomId(UUID classroomId);

    List<EmulationEntry> findByClassroomIdAndMemberId(UUID classroomId, UUID memberId);

    @Query("SELECT e.memberId, SUM(e.score) FROM EmulationEntry e WHERE e.classroomId = :classroomId GROUP BY e.memberId")
    List<Object[]> sumScoreByMember(@Param("classroomId") UUID classroomId);
}
