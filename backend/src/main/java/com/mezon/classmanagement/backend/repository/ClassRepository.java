package com.mezon.classmanagement.backend.repository;

import com.mezon.classmanagement.backend.dto.response.child.ClassMemberResponseDto;
import com.mezon.classmanagement.backend.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {

	@Query(value = """
		SELECT new com.mezon.classmanagement.backend.dto.response.child.ClassMemberResponseDto(
			class.id,
			class.name,
			user.id,
			user.displayName,
			user.avatarUrl,
			classUser.role
		)
		FROM ClassUser classUser
		JOIN classUser.clazz class
		JOIN classUser.user user
		WHERE class.id = :classId
	""")
	List<ClassMemberResponseDto> getClassMembers(Long classId);

}