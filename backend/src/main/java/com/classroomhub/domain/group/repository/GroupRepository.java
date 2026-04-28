package com.classroomhub.domain.group.repository;

import com.classroomhub.domain.group.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GroupRepository extends JpaRepository<Group, UUID> {
    List<Group> findAllByClassroomId(UUID classroomId);
}
