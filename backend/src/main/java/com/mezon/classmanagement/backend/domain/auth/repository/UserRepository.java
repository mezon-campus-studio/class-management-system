package com.mezon.classmanagement.backend.domain.auth.repository;

import com.mezon.classmanagement.backend.domain.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	@Transactional(readOnly = true)
	Optional<User> findByUsername(String username);

	boolean existsByUsername(String username);

}