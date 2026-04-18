package com.mezon.classmanagement.backend.repository;

import com.mezon.classmanagement.backend.entity.ClassUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassUserRepository extends JpaRepository<ClassUser, Long> {
	Optional<ClassUser> findByClazzIdAndUserId(Long classId, Long userId);
}