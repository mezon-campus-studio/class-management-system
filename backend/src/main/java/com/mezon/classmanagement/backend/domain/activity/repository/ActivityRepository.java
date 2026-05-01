package com.mezon.classmanagement.backend.domain.activity.repository;

import com.mezon.classmanagement.backend.domain.activity.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
	List<Activity> findByClazz_Id(Long classId);
	Optional<Activity> findByClazz_IdAndId(Long classId, Long activityId);
}