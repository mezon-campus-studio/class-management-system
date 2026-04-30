package com.mezon.classmanagement.backend.domain.groupuser.repository;

import com.mezon.classmanagement.backend.domain.groupuser.entity.GroupUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupUserRepository extends JpaRepository<GroupUser, Long> {
	boolean existsByClazz_IdAndGroup_IdAndUser_Id(Long classId, Long groupId, Long userId);
	Optional<GroupUser> findByClazz_IdAndGroup_IdAndUser_Id(Long classId, Long groupId, Long userId);
	List<GroupUser> findByClazz_IdAndGroup_Id(Long classId, Long groupId);
}