package com.mezon.classmanagement.backend.repository;

import com.mezon.classmanagement.backend.dto.clazz.ClassDto;
import com.mezon.classmanagement.backend.dto.response.child.ClassMemberResponseDto;
import com.mezon.classmanagement.backend.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {

	Optional<Class> findByCode(String code);

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

	/*
	@Query(value = """
		SELECT new com.mezon.classmanagement.backend.dto.clazz.ClassDto(
			class.id,
			owner.id,
			class.name,
			class.description,
			class.code,
			class.avatarUrl,
			class.privacy,
			class.createdAt
		)
		FROM Class class
		JOIN class.owner owner
		WHERE owner.id = :userId
	""")
	List<ClassDto> getJoinedClasses(Long userId);
	*/

	@Query(value = """
		SELECT new com.mezon.classmanagement.backend.dto.clazz.ClassDto(
			clazz.id,
			clazz.owner.id,
			clazz.name,
			clazz.description,
			clazz.code,
			clazz.avatarUrl,
			clazz.privacy,
			clazz.createdAt
		)
		FROM ClassUser classUser
		JOIN classUser.clazz clazz
		WHERE classUser.user.id = :userId
	""")
	List<ClassDto> getJoinedClasses(Long userId);

}