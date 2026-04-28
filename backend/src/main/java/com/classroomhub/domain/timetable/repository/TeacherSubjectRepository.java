package com.classroomhub.domain.timetable.repository;

import com.classroomhub.domain.timetable.entity.TeacherSubject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeacherSubjectRepository extends JpaRepository<TeacherSubject, UUID> {

    List<TeacherSubject> findByTeacherId(UUID teacherId);

    List<TeacherSubject> findBySubjectId(UUID subjectId);

    Optional<TeacherSubject> findByTeacherIdAndSubjectId(UUID teacherId, UUID subjectId);

    boolean existsByTeacherIdAndSubjectId(UUID teacherId, UUID subjectId);

    void deleteByTeacherIdAndSubjectId(UUID teacherId, UUID subjectId);
}
