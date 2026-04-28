package com.classroomhub.domain.parent.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.classroom.entity.Classroom;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.repository.ClassroomMemberRepository;
import com.classroomhub.domain.classroom.repository.ClassroomRepository;
import com.classroomhub.domain.evaluation.dto.EvaluationResponse;
import com.classroomhub.domain.evaluation.entity.StudentEvaluation;
import com.classroomhub.domain.evaluation.repository.StudentEvaluationRepository;
import com.classroomhub.domain.event.dto.AbsenceRequestResponse;
import com.classroomhub.domain.event.entity.AbsenceRequest;
import com.classroomhub.domain.event.repository.AbsenceRequestRepository;
import com.classroomhub.domain.parent.dto.ChildClassroomResponse;
import com.classroomhub.domain.parent.dto.LinkedStudentResponse;
import com.classroomhub.domain.parent.dto.ParentAbsenceRequest;
import com.classroomhub.domain.parent.dto.ParentClassroomDetailResponse;
import com.classroomhub.domain.parent.entity.ParentLink;
import com.classroomhub.domain.parent.repository.ParentLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ParentService {

    private final ParentLinkRepository parentLinkRepository;
    private final UserRepository userRepository;
    private final ClassroomMemberRepository classroomMemberRepository;
    private final ClassroomRepository classroomRepository;
    private final StudentEvaluationRepository evaluationRepository;
    private final AbsenceRequestRepository absenceRequestRepository;

    public List<LinkedStudentResponse> listMyChildren(UUID parentId) {
        return parentLinkRepository.findByParentIdAndStatus(parentId, ParentLink.Status.ACTIVE).stream()
                .map(link -> {
                    User student = userRepository.findById(link.getStudentId()).orElse(null);
                    if (student == null) return null;
                    return LinkedStudentResponse.of(link,
                            student.getDisplayName(), student.getEmail(),
                            student.getStudentCode(), student.getAvatarUrl());
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public List<ChildClassroomResponse> listChildClassrooms(UUID parentId) {
        List<ParentLink> links = parentLinkRepository.findByParentIdAndStatus(
                parentId, ParentLink.Status.ACTIVE);
        List<ChildClassroomResponse> result = new ArrayList<>();
        for (ParentLink link : links) {
            User student = userRepository.findById(link.getStudentId()).orElse(null);
            if (student == null) continue;
            List<ClassroomMember> memberships = classroomMemberRepository.findAllByUserId(link.getStudentId());
            for (ClassroomMember m : memberships) {
                Classroom c = classroomRepository.findById(m.getClassroomId()).orElse(null);
                if (c == null || c.getStatus() != Classroom.Status.ACTIVE) continue;
                result.add(new ChildClassroomResponse(
                        c.getId(), c.getName(), c.getCoverImageUrl(),
                        student.getId(), student.getDisplayName(), student.getStudentCode()));
            }
        }
        return result;
    }

    public ParentClassroomDetailResponse getChildClassroomDetail(UUID parentId, UUID classroomId) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CLASSROOM_NOT_FOUND));
        // Find the linked child who is in this classroom
        for (ParentLink link : parentLinkRepository.findByParentIdAndStatus(parentId, ParentLink.Status.ACTIVE)) {
            if (classroomMemberRepository.existsByClassroomIdAndUserId(classroomId, link.getStudentId())) {
                User student = userRepository.findById(link.getStudentId()).orElse(null);
                if (student == null) continue;
                return new ParentClassroomDetailResponse(
                        classroom.getId(), classroom.getName(),
                        classroom.getDescription(), classroom.getCoverImageUrl(),
                        student.getId(), student.getDisplayName(), student.getStudentCode());
            }
        }
        throw new BusinessException(ErrorCode.FORBIDDEN);
    }

    public List<EvaluationResponse> getChildEvaluations(UUID parentId, UUID classroomId) {
        UUID studentId = resolveChildInClassroom(parentId, classroomId);
        List<StudentEvaluation> evals = evaluationRepository
                .findAllByClassroomIdAndStudentIdOrderByCreatedAtDesc(classroomId, studentId);
        List<UUID> userIds = evals.stream()
                .flatMap(e -> java.util.stream.Stream.of(e.getStudentId(), e.getTeacherId()))
                .distinct().toList();
        Map<UUID, String> names = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getDisplayName));
        return evals.stream()
                .map(e -> new EvaluationResponse(
                        e.getId(), e.getClassroomId(), e.getStudentId(),
                        names.getOrDefault(e.getStudentId(), ""),
                        e.getTeacherId(), names.getOrDefault(e.getTeacherId(), ""),
                        e.getCategory(), e.getScore(), e.getTitle(), e.getContent(),
                        e.getPeriod(), e.getCreatedAt()))
                .toList();
    }

    @Transactional
    public AbsenceRequestResponse submitAbsenceForChild(UUID parentId, UUID classroomId, ParentAbsenceRequest req) {
        UUID studentId = resolveChildInClassroom(parentId, classroomId);
        AbsenceRequest ar = AbsenceRequest.builder()
                .classroomId(classroomId)
                .userId(studentId)
                .reason(req.reason())
                .absenceDate(req.date())
                .note(req.note())
                .submittedByParentId(parentId)
                .status(AbsenceRequest.Status.PENDING)
                .build();
        absenceRequestRepository.save(ar);
        return new AbsenceRequestResponse(ar.getId(), ar.getUserId(), ar.getEventId(),
                ar.getReason(), ar.getStatus(), ar.getReviewedById(), ar.getReviewNote(),
                ar.getReviewedAt(), ar.getCreatedAt());
    }

    private UUID resolveChildInClassroom(UUID parentId, UUID classroomId) {
        for (ParentLink link : parentLinkRepository.findByParentIdAndStatus(parentId, ParentLink.Status.ACTIVE)) {
            if (classroomMemberRepository.existsByClassroomIdAndUserId(classroomId, link.getStudentId())) {
                return link.getStudentId();
            }
        }
        throw new BusinessException(ErrorCode.FORBIDDEN);
    }

    public boolean parentCanAccessClassroom(UUID parentId, UUID classroomId) {
        for (ParentLink link : parentLinkRepository.findByParentIdAndStatus(parentId, ParentLink.Status.ACTIVE)) {
            if (classroomMemberRepository.existsByClassroomIdAndUserId(classroomId, link.getStudentId())) {
                return true;
            }
        }
        return false;
    }

    @Transactional
    public LinkedStudentResponse linkStudent(UUID parentId, String studentCode, String relationship) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN));
        if (parent.getUserType() != User.UserType.PARENT) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        User student = userRepository.findByStudentCode(studentCode.trim().toUpperCase())
                .filter(u -> u.getUserType() == User.UserType.STUDENT)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDENT_NOT_FOUND));
        if (parentLinkRepository.existsByParentIdAndStudentId(parentId, student.getId())) {
            throw new BusinessException(ErrorCode.PARENT_LINK_NOT_FOUND); // reuse — already linked
        }
        ParentLink link = parentLinkRepository.save(ParentLink.builder()
                .parentId(parentId)
                .studentId(student.getId())
                .relationship(relationship)
                .status(ParentLink.Status.ACTIVE)
                .build());
        return LinkedStudentResponse.of(link,
                student.getDisplayName(), student.getEmail(),
                student.getStudentCode(), student.getAvatarUrl());
    }

    @Transactional
    public void unlinkStudent(UUID parentId, UUID linkId) {
        ParentLink link = parentLinkRepository.findById(linkId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARENT_LINK_NOT_FOUND));
        if (!link.getParentId().equals(parentId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        parentLinkRepository.delete(link);
    }
}
