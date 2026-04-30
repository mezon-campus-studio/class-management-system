package com.mezon.classmanagement.backend.domain.classuser.repository;

import com.mezon.classmanagement.backend.domain.classuser.entity.ClassUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassUserRepository extends JpaRepository<ClassUser, Long> {
	Optional<ClassUser> findByClazz_IdAndUser_Id(Long classId, Long userId);
	boolean existsByClazz_IdAndUser_Id(Long classId, Long userId);
}