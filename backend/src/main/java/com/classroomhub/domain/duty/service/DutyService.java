package com.classroomhub.domain.duty.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.service.ClassroomService;
import com.classroomhub.domain.duty.dto.*;
import com.classroomhub.domain.duty.entity.DutyAssignment;
import com.classroomhub.domain.duty.entity.DutyType;
import com.classroomhub.domain.duty.repository.DutyAssignmentRepository;
import com.classroomhub.domain.duty.repository.DutyTypeRepository;
import com.classroomhub.domain.notification.entity.Notification;
import com.classroomhub.domain.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DutyService {

    private final DutyTypeRepository dutyTypeRepository;
    private final DutyAssignmentRepository dutyAssignmentRepository;
    private final ClassroomService classroomService;
    private final NotificationService notificationService;

    @Transactional
    public DutyTypeResponse createDutyType(UUID classroomId, CreateDutyTypeRequest req, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_DUTY_TYPES);
        DutyType dutyType = DutyType.builder()
                .classroomId(classroomId)
                .name(req.name())
                .description(req.description())
                .build();
        dutyTypeRepository.save(dutyType);
        return toTypeResponse(dutyType);
    }

    @Transactional(readOnly = true)
    public List<DutyTypeResponse> listDutyTypes(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return dutyTypeRepository.findByClassroomId(classroomId).stream()
                .map(this::toTypeResponse)
                .toList();
    }

    @Transactional
    public DutyTypeResponse updateDutyType(UUID classroomId, UUID dutyTypeId, UpdateDutyTypeRequest req, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_DUTY_TYPES);
        DutyType dutyType = dutyTypeRepository.findByIdAndClassroomId(dutyTypeId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DUTY_TYPE_NOT_FOUND));
        if (req.name() != null) dutyType.setName(req.name());
        if (req.description() != null) dutyType.setDescription(req.description());
        dutyType.setActive(req.active());
        dutyTypeRepository.save(dutyType);
        return toTypeResponse(dutyType);
    }

    @Transactional
    public void deleteDutyType(UUID classroomId, UUID dutyTypeId, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_DUTY_TYPES);
        DutyType dutyType = dutyTypeRepository.findByIdAndClassroomId(dutyTypeId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DUTY_TYPE_NOT_FOUND));
        dutyTypeRepository.delete(dutyType);
    }

    @Transactional
    public AssignmentResponse createAssignment(UUID classroomId, CreateAssignmentRequest req, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_DUTY_ASSIGNMENTS);
        DutyType dutyType = dutyTypeRepository.findByIdAndClassroomId(req.dutyTypeId(), classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DUTY_TYPE_NOT_FOUND));
        DutyAssignment assignment = DutyAssignment.builder()
                .dutyTypeId(dutyType.getId())
                .classroomId(classroomId)
                .assignedToId(req.assignedToId())
                .dutyDate(req.dutyDate())
                .note(req.note())
                .build();
        dutyAssignmentRepository.save(assignment);
        notificationService.send(
                assignment.getAssignedToId(), classroomId,
                Notification.Type.DUTY_ASSIGNED,
                "Phân công trực nhật",
                "Bạn được phân công: " + dutyType.getName() + " vào ngày " + req.dutyDate(),
                assignment.getId()
        );
        return toAssignmentResponse(assignment, dutyType.getName());
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> listAssignments(UUID classroomId, LocalDate date, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        List<DutyAssignment> assignments = date != null
                ? dutyAssignmentRepository.findByClassroomIdAndDutyDate(classroomId, date)
                : dutyAssignmentRepository.findByClassroomId(classroomId);
        Map<UUID, String> typeNames = buildTypeNameMap(classroomId);
        return assignments.stream()
                .map(a -> toAssignmentResponse(a, typeNames.getOrDefault(a.getDutyTypeId(), "")))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> listMyAssignments(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        List<DutyAssignment> assignments = dutyAssignmentRepository.findByClassroomIdAndAssignedToId(classroomId, userId);
        Map<UUID, String> typeNames = buildTypeNameMap(classroomId);
        return assignments.stream()
                .map(a -> toAssignmentResponse(a, typeNames.getOrDefault(a.getDutyTypeId(), "")))
                .toList();
    }

    @Transactional
    public AssignmentResponse confirmCompletion(UUID classroomId, UUID assignmentId, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_DUTY_ASSIGNMENTS);
        DutyAssignment assignment = dutyAssignmentRepository.findById(assignmentId)
                .filter(a -> a.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.DUTY_ASSIGNMENT_NOT_FOUND));
        if (assignment.getStatus() == DutyAssignment.Status.COMPLETED) {
            throw new BusinessException(ErrorCode.DUTY_ALREADY_COMPLETED);
        }
        assignment.setStatus(DutyAssignment.Status.COMPLETED);
        assignment.setConfirmedById(userId);
        assignment.setConfirmedAt(Instant.now());
        dutyAssignmentRepository.save(assignment);
        notificationService.send(
                assignment.getAssignedToId(), classroomId,
                Notification.Type.DUTY_CONFIRMED,
                "Trực nhật hoàn thành",
                "Trực nhật của bạn đã được xác nhận hoàn thành",
                assignment.getId()
        );
        Map<UUID, String> typeNames = buildTypeNameMap(classroomId);
        return toAssignmentResponse(assignment, typeNames.getOrDefault(assignment.getDutyTypeId(), ""));
    }

    @Transactional
    public AssignmentResponse updateAssignment(UUID classroomId, UUID assignmentId, UpdateAssignmentRequest req, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_DUTY_ASSIGNMENTS);
        DutyAssignment assignment = dutyAssignmentRepository.findById(assignmentId)
                .filter(a -> a.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.DUTY_ASSIGNMENT_NOT_FOUND));

        if (req.dutyTypeId() != null && !req.dutyTypeId().equals(assignment.getDutyTypeId())) {
            // Validate the new type belongs to this classroom.
            dutyTypeRepository.findByIdAndClassroomId(req.dutyTypeId(), classroomId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.DUTY_TYPE_NOT_FOUND));
            assignment.setDutyTypeId(req.dutyTypeId());
        }
        if (req.assignedToId() != null) assignment.setAssignedToId(req.assignedToId());
        if (req.dutyDate() != null) assignment.setDutyDate(req.dutyDate());
        if (req.status() != null) {
            // Reverting away from COMPLETED clears confirmation metadata.
            if (assignment.getStatus() == DutyAssignment.Status.COMPLETED
                    && req.status() != DutyAssignment.Status.COMPLETED) {
                assignment.setConfirmedById(null);
                assignment.setConfirmedAt(null);
            }
            assignment.setStatus(req.status());
        }
        if (req.note() != null) assignment.setNote(req.note().isEmpty() ? null : req.note());
        dutyAssignmentRepository.save(assignment);
        Map<UUID, String> typeNames = buildTypeNameMap(classroomId);
        return toAssignmentResponse(assignment, typeNames.getOrDefault(assignment.getDutyTypeId(), ""));
    }

    @Transactional
    public void deleteAssignment(UUID classroomId, UUID assignmentId, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_DUTY_ASSIGNMENTS);
        DutyAssignment assignment = dutyAssignmentRepository.findById(assignmentId)
                .filter(a -> a.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.DUTY_ASSIGNMENT_NOT_FOUND));
        dutyAssignmentRepository.delete(assignment);
    }

    @Scheduled(cron = "0 0 20 * * *")
    @Transactional(readOnly = true)
    public void sendDutyReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        dutyAssignmentRepository.findByDutyDateAndStatus(tomorrow, DutyAssignment.Status.PENDING)
                .forEach(assignment -> notificationService.send(
                        assignment.getAssignedToId(), assignment.getClassroomId(),
                        Notification.Type.DUTY_REMINDER,
                        "Nhắc nhở trực nhật",
                        "Bạn có lịch trực nhật vào ngày mai (" + tomorrow + ")",
                        assignment.getId()
                ));
    }

    private Map<UUID, String> buildTypeNameMap(UUID classroomId) {
        return dutyTypeRepository.findByClassroomId(classroomId).stream()
                .collect(Collectors.toMap(DutyType::getId, DutyType::getName));
    }

    private DutyTypeResponse toTypeResponse(DutyType dutyType) {
        return new DutyTypeResponse(
                dutyType.getId(),
                dutyType.getName(),
                dutyType.getDescription(),
                dutyType.isActive()
        );
    }

    private AssignmentResponse toAssignmentResponse(DutyAssignment assignment, String dutyTypeName) {
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getDutyTypeId(),
                dutyTypeName,
                assignment.getAssignedToId(),
                assignment.getDutyDate(),
                assignment.getStatus(),
                assignment.getNote(),
                assignment.getConfirmedById(),
                assignment.getConfirmedAt()
        );
    }
}
