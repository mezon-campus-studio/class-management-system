package com.mezon.classmanagement.backend.domain.auth.repository;

import com.mezon.classmanagement.backend.domain.auth.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, Long> {
}