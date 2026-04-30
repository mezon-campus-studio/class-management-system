package com.mezon.classmanagement.backend.domain.activity.repository;

import com.mezon.classmanagement.backend.domain.activity.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
	boolean existsByClazz_Id(Long classId);
}