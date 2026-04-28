package com.classroomhub.domain.timetable.repository;

import com.classroomhub.domain.timetable.entity.ClassroomSubjectConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClassroomSubjectConfigRepository extends JpaRepository<ClassroomSubjectConfig, UUID> {

    List<ClassroomSubjectConfig> findByClassroomId(UUID classroomId);

    List<ClassroomSubjectConfig> findByClassroomIdIn(List<UUID> classroomIds);

    Optional<ClassroomSubjectConfig> findByClassroomIdAndSubjectId(UUID classroomId, UUID subjectId);

    boolean existsByClassroomIdAndSubjectId(UUID classroomId, UUID subjectId);

    void deleteByClassroomId(UUID classroomId);
}
