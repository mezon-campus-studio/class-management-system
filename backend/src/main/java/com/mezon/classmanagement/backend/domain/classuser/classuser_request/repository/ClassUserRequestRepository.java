package com.mezon.classmanagement.backend.domain.classuser.classuser_request.repository;

import com.mezon.classmanagement.backend.domain.classuser.classuser_request.entity.ClassUserRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassUserRequestRepository extends JpaRepository<ClassUserRequest, Long> {
	boolean existsByClazz_IdAndUser_IdAndStatus(Long classId, Long userId, ClassUserRequest.Status status);
}