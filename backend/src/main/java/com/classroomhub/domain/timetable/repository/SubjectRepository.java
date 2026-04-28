package com.classroomhub.domain.timetable.repository;

import com.classroomhub.domain.timetable.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SubjectRepository extends JpaRepository<Subject, UUID> {

    Optional<Subject> findByCode(String code);

    boolean existsByCode(String code);
}
