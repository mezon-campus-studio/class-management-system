package com.classroomhub.domain.group.repository;

import com.classroomhub.domain.group.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupMemberRepository extends JpaRepository<GroupMember, UUID> {
    List<GroupMember> findAllByGroupId(UUID groupId);
    Optional<GroupMember> findByGroupIdAndUserId(UUID groupId, UUID userId);
    boolean existsByClassroomMemberIdAndGroupId(UUID classroomMemberId, UUID groupId);

    /** Check if a classroom member is already in any group within this classroom's groups */
    boolean existsByClassroomMemberId(UUID classroomMemberId);
    void deleteAllByGroupId(UUID groupId);

    List<GroupMember> findAllByUserId(UUID userId);
}
