package com.classroomhub.domain.classroom.repository;

import com.classroomhub.domain.classroom.entity.ClassroomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

public interface ClassroomMemberRepository extends JpaRepository<ClassroomMember, UUID> {

    Optional<ClassroomMember> findByClassroomIdAndUserId(UUID classroomId, UUID userId);

    boolean existsByClassroomIdAndUserId(UUID classroomId, UUID userId);

    List<ClassroomMember> findAllByClassroomId(UUID classroomId);

    int countByClassroomId(UUID classroomId);

    @Query("SELECT m FROM ClassroomMember m WHERE m.userId = :userId ORDER BY m.joinedAt DESC")
    List<ClassroomMember> findAllByUserId(UUID userId);

    @Query("SELECT m.classroomId, COUNT(m) FROM ClassroomMember m WHERE m.classroomId IN :ids GROUP BY m.classroomId")
    List<Object[]> countsByClassroomIds(@Param("ids") List<UUID> ids);

    default Map<UUID, Integer> countMapByClassroomIds(List<UUID> ids) {
        return countsByClassroomIds(ids).stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> ((Long) row[1]).intValue()
                ));
    }
}
