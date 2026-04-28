package com.classroomhub.domain.evaluation.repository;

import com.classroomhub.domain.evaluation.entity.StudentEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentEvaluationRepository extends JpaRepository<StudentEvaluation, UUID> {

    List<StudentEvaluation> findAllByClassroomIdOrderByCreatedAtDesc(UUID classroomId);

    List<StudentEvaluation> findAllByClassroomIdAndStudentIdOrderByCreatedAtDesc(UUID classroomId, UUID studentId);
}
