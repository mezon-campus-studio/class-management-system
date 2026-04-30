package com.mezon.classmanagement.backend.domain.group.repository;

import com.mezon.classmanagement.backend.domain.group.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
	boolean existsByClazz_IdAndId(Long classId, Long groupId);
}