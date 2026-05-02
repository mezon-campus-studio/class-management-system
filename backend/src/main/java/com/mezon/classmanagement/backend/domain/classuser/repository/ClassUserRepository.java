package com.mezon.classmanagement.backend.domain.classuser.repository;

import com.mezon.classmanagement.backend.domain.classuser.dto.ClassUserResponseDto;
import com.mezon.classmanagement.backend.domain.classuser.entity.ClassUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassUserRepository extends JpaRepository<ClassUser, Long> {
	@Query(value = """
		SELECT new com.mezon.classmanagement.backend.domain.classuser.dto.ClassUserResponseDto(
			classUser.id,
			class.id,
			class.name,
			user.id,
			user.displayName,
			user.avatarUrl,
			classUser.joinedAt
		)
		FROM ClassUser classUser
		JOIN classUser.clazz class
		JOIN classUser.user user
		WHERE class.id = :classId
	""")
	List<ClassUserResponseDto> getClassUsers(Long classId);
	Optional<ClassUser> findByClazz_IdAndUser_Id(Long classId, Long userId);
	boolean existsByClazz_IdAndUser_Id(Long classId, Long userId);
}