package com.classroomhub.domain.evaluation.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.service.ClassroomService;
import com.classroomhub.domain.evaluation.dto.EvaluationRequest;
import com.classroomhub.domain.evaluation.dto.EvaluationResponse;
import com.classroomhub.domain.evaluation.entity.StudentEvaluation;
import com.classroomhub.domain.evaluation.repository.StudentEvaluationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class EvaluationService {

    private final StudentEvaluationRepository evaluationRepository;
    private final ClassroomService classroomService;
    private final UserRepository userRepository;

    public List<EvaluationResponse> listByClassroom(UUID classroomId, UUID requesterId) {
        classroomService.requireMember(classroomId, requesterId);
        List<StudentEvaluation> evals = evaluationRepository.findAllByClassroomIdOrderByCreatedAtDesc(classroomId);
        return enrich(evals);
    }

    public List<EvaluationResponse> listByStudent(UUID classroomId, UUID studentId, UUID requesterId) {
        classroomService.requireMember(classroomId, requesterId);
        List<StudentEvaluation> evals = evaluationRepository
                .findAllByClassroomIdAndStudentIdOrderByCreatedAtDesc(classroomId, studentId);
        return enrich(evals);
    }

    @Transactional
    public EvaluationResponse create(UUID classroomId, UUID teacherId, EvaluationRequest req) {
        classroomService.requireRoleAtLeast(classroomId, teacherId, ClassroomMember.Role.TEACHER);
        classroomService.requireMember(classroomId, req.studentId());

        StudentEvaluation eval = StudentEvaluation.builder()
                .classroomId(classroomId)
                .studentId(req.studentId())
                .teacherId(teacherId)
                .category(req.category() != null ? req.category() : StudentEvaluation.Category.GENERAL)
                .score(req.score())
                .title(req.title())
                .content(req.content())
                .period(req.period())
                .build();
        eval = evaluationRepository.save(eval);
        return toResponse(eval,
                nameOf(req.studentId()),
                nameOf(teacherId));
    }

    @Transactional
    public void delete(UUID classroomId, UUID evaluationId, UUID requesterId) {
        StudentEvaluation eval = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN));
        if (!eval.getClassroomId().equals(classroomId)) throw new BusinessException(ErrorCode.FORBIDDEN);
        // Only the author or an OWNER can delete
        if (!eval.getTeacherId().equals(requesterId)) {
            classroomService.requireRoleAtLeast(classroomId, requesterId, ClassroomMember.Role.OWNER);
        }
        evaluationRepository.delete(eval);
    }

    // ─── helpers ────────────────────────────────────────────────────────────────

    private List<EvaluationResponse> enrich(List<StudentEvaluation> evals) {
        List<UUID> userIds = evals.stream()
                .flatMap(e -> java.util.stream.Stream.of(e.getStudentId(), e.getTeacherId()))
                .distinct().toList();
        Map<UUID, String> names = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getDisplayName));
        return evals.stream()
                .map(e -> toResponse(e, names.getOrDefault(e.getStudentId(), ""),
                        names.getOrDefault(e.getTeacherId(), "")))
                .toList();
    }

    private String nameOf(UUID userId) {
        return userRepository.findById(userId).map(User::getDisplayName).orElse("");
    }

    private static EvaluationResponse toResponse(StudentEvaluation e, String studentName, String teacherName) {
        return new EvaluationResponse(e.getId(), e.getClassroomId(), e.getStudentId(), studentName,
                e.getTeacherId(), teacherName, e.getCategory(), e.getScore(),
                e.getTitle(), e.getContent(), e.getPeriod(), e.getCreatedAt());
    }
}
