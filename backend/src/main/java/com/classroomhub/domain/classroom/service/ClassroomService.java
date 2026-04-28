package com.classroomhub.domain.classroom.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.classroom.dto.*;
import com.classroomhub.domain.classroom.entity.Classroom;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.repository.ClassroomMemberRepository;
import com.classroomhub.domain.classroom.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final ClassroomMemberRepository memberRepository;
    private final UserRepository userRepository;

    private static final String INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Transactional
    public ClassroomResponse create(UUID ownerId, CreateClassroomRequest req) {
        Classroom classroom = Classroom.builder()
                .name(req.name())
                .description(req.description())
                .coverImageUrl(req.coverImageUrl())
                .inviteCode(generateInviteCode())
                .inviteCodeExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .ownerId(ownerId)
                .maxMembers(req.maxMembers() != null ? req.maxMembers() : 100)
                .build();
        classroomRepository.save(classroom);

        ClassroomMember owner = ClassroomMember.builder()
                .classroomId(classroom.getId())
                .userId(ownerId)
                .role(ClassroomMember.Role.OWNER)
                .build();
        memberRepository.save(owner);

        return ClassroomResponse.from(classroom, 1, ClassroomMember.Role.OWNER);
    }

    @Transactional(readOnly = true)
    public List<ClassroomResponse> listMyClassrooms(UUID userId) {
        List<ClassroomMember> memberships = memberRepository.findAllByUserId(userId);
        if (memberships.isEmpty()) return List.of();

        List<UUID> classroomIds = memberships.stream().map(ClassroomMember::getClassroomId).toList();
        Map<UUID, ClassroomMember> membershipByClassroom = memberships.stream()
                .collect(Collectors.toMap(ClassroomMember::getClassroomId, Function.identity()));

        return classroomRepository.findAllById(classroomIds).stream()
                .map(c -> {
                    int count = memberRepository.countByClassroomId(c.getId());
                    ClassroomMember.Role role = membershipByClassroom.get(c.getId()).getRole();
                    return ClassroomResponse.from(c, count, role);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public ClassroomResponse get(UUID classroomId, UUID userId) {
        Classroom classroom = requireClassroom(classroomId);
        ClassroomMember member = requireMember(classroomId, userId);
        int count = memberRepository.countByClassroomId(classroomId);
        return ClassroomResponse.from(classroom, count, member.getRole());
    }

    @Transactional
    public ClassroomResponse update(UUID classroomId, UUID userId, UpdateClassroomRequest req) {
        Classroom classroom = requireClassroom(classroomId);
        requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.TEACHER);

        if (req.name() != null) classroom.setName(req.name());
        if (req.description() != null) classroom.setDescription(req.description());
        if (req.coverImageUrl() != null) classroom.setCoverImageUrl(req.coverImageUrl());
        if (req.maxMembers() != null) classroom.setMaxMembers(req.maxMembers());
        classroomRepository.save(classroom);

        int count = memberRepository.countByClassroomId(classroomId);
        ClassroomMember.Role myRole = memberRepository.findByClassroomIdAndUserId(classroomId, userId)
                .map(ClassroomMember::getRole).orElse(ClassroomMember.Role.MEMBER);
        return ClassroomResponse.from(classroom, count, myRole);
    }

    @Transactional
    public String regenerateInviteCode(UUID classroomId, UUID userId) {
        Classroom classroom = requireClassroom(classroomId);
        requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.TEACHER);
        classroom.setInviteCode(generateInviteCode());
        classroom.setInviteCodeExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        classroomRepository.save(classroom);
        return classroom.getInviteCode();
    }

    @Transactional
    public ClassroomResponse joinByCode(UUID userId, String code) {
        User user = userRepository.findById(userId).orElseThrow();
        if (user.getUserType() == User.UserType.PARENT) {
            throw new BusinessException(ErrorCode.PARENT_CANNOT_JOIN_CLASSROOM);
        }
        if (user.getUserType() == User.UserType.SYSTEM_ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        Classroom classroom = classroomRepository.findByInviteCode(code.toUpperCase())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVITE_CODE_INVALID));

        if (classroom.getInviteCodeExpiresAt() != null
                && Instant.now().isAfter(classroom.getInviteCodeExpiresAt())) {
            throw new BusinessException(ErrorCode.INVITE_CODE_INVALID);
        }
        if (classroom.getStatus() != Classroom.Status.ACTIVE) {
            throw new BusinessException(ErrorCode.CLASSROOM_NOT_FOUND);
        }
        if (memberRepository.existsByClassroomIdAndUserId(classroom.getId(), userId)) {
            throw new BusinessException(ErrorCode.ALREADY_MEMBER);
        }

        int currentCount = memberRepository.countByClassroomId(classroom.getId());
        if (currentCount >= classroom.getMaxMembers()) {
            throw new BusinessException(ErrorCode.CLASSROOM_FULL);
        }

        ClassroomMember member = ClassroomMember.builder()
                .classroomId(classroom.getId())
                .userId(userId)
                .displayName(user.getDisplayName())
                .role(user.getUserType() == User.UserType.TEACHER
                        ? ClassroomMember.Role.TEACHER : ClassroomMember.Role.MEMBER)
                .build();
        memberRepository.save(member);

        return ClassroomResponse.from(classroom, currentCount + 1, member.getRole());
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> listMembers(UUID classroomId, UUID requesterId) {
        requireMember(classroomId, requesterId);
        List<ClassroomMember> members = memberRepository.findAllByClassroomId(classroomId);
        List<UUID> userIds = members.stream().map(ClassroomMember::getUserId).toList();
        Map<UUID, User> users = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return members.stream()
                .map(m -> toMemberResponse(m, users.get(m.getUserId())))
                .toList();
    }

    @Transactional
    public MemberResponse updateMemberRole(UUID classroomId, UUID memberId, UUID requesterId, UpdateMemberRoleRequest req) {
        requireRoleAtLeast(classroomId, requesterId, ClassroomMember.Role.TEACHER);

        ClassroomMember member = memberRepository.findById(memberId)
                .filter(m -> m.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (member.getRole() == ClassroomMember.Role.OWNER) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        member.setRole(req.role());
        memberRepository.save(member);

        return toMemberResponse(member, userRepository.findById(member.getUserId()).orElse(null));
    }

    @Transactional
    public MemberResponse updateMemberExtras(UUID classroomId, UUID memberId, UUID requesterId, UpdateMemberExtrasRequest req) {
        requireRoleAtLeast(classroomId, requesterId, ClassroomMember.Role.TEACHER);

        ClassroomMember member = memberRepository.findById(memberId)
                .filter(m -> m.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (req.extraRoles() != null) {
            Set<ClassroomMember.Role> sanitized = req.extraRoles().stream()
                    .filter(r -> r != ClassroomMember.Role.OWNER && r != ClassroomMember.Role.TEACHER)
                    .filter(r -> r != member.getRole())
                    .collect(Collectors.toSet());
            member.setExtraRoles(sanitized);
        }
        if (req.delegatedPermissions() != null) {
            member.setDelegatedPermissions(new HashSet<>(req.delegatedPermissions()));
        }
        memberRepository.save(member);

        return toMemberResponse(member, userRepository.findById(member.getUserId()).orElse(null));
    }

    private MemberResponse toMemberResponse(ClassroomMember m, User u) {
        return new MemberResponse(
                m.getId(),
                m.getUserId(),
                m.getDisplayName() != null ? m.getDisplayName() : (u != null ? u.getDisplayName() : ""),
                u != null ? u.getAvatarUrl() : null,
                m.getRole(),
                m.getExtraRoles() != null ? m.getExtraRoles() : Set.of(),
                m.getDelegatedPermissions() != null ? m.getDelegatedPermissions() : Set.of(),
                m.getJoinedAt());
    }

    @Transactional
    public void removeMember(UUID classroomId, UUID memberId, UUID requesterId) {
        requireRoleAtLeast(classroomId, requesterId, ClassroomMember.Role.TEACHER);

        ClassroomMember member = memberRepository.findById(memberId)
                .filter(m -> m.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (member.getRole() == ClassroomMember.Role.OWNER) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        memberRepository.delete(member);
    }

    @Transactional
    public void leave(UUID classroomId, UUID userId) {
        ClassroomMember member = requireMember(classroomId, userId);
        if (member.getRole() == ClassroomMember.Role.OWNER) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        memberRepository.delete(member);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private Classroom requireClassroom(UUID classroomId) {
        return classroomRepository.findById(classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CLASSROOM_NOT_FOUND));
    }

    public ClassroomMember requireMember(UUID classroomId, UUID userId) {
        return memberRepository.findByClassroomIdAndUserId(classroomId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_CLASSROOM_MEMBER));
    }

    private static final List<ClassroomMember.Role> ROLE_ORDER = List.of(
            ClassroomMember.Role.MEMBER,
            ClassroomMember.Role.GROUP_LEADER,
            ClassroomMember.Role.TREASURER,
            ClassroomMember.Role.VICE_MONITOR,
            ClassroomMember.Role.MONITOR,
            ClassroomMember.Role.TEACHER,
            ClassroomMember.Role.OWNER
    );

    public void requireRoleAtLeast(UUID classroomId, UUID userId, ClassroomMember.Role minRole) {
        ClassroomMember member = requireMember(classroomId, userId);
        int min = ROLE_ORDER.indexOf(minRole);
        if (rankOf(member.getRole()) >= min) return;
        if (member.getExtraRoles() != null
                && member.getExtraRoles().stream().anyMatch(r -> rankOf(r) >= min)) {
            return;
        }
        throw new BusinessException(ErrorCode.FORBIDDEN);
    }

    /**
     * Allow the action if the member is a teacher (or above) OR has the
     * permission explicitly delegated. Use this for actions a teacher
     * may want to delegate to a specific student (e.g. lớp trưởng
     * quản lý hạng mục thi đua).
     */
    public void requirePermission(UUID classroomId, UUID userId, ClassroomMember.DelegatedPermission permission) {
        ClassroomMember member = requireMember(classroomId, userId);
        if (rankOf(member.getRole()) >= ROLE_ORDER.indexOf(ClassroomMember.Role.TEACHER)) return;
        if (member.getDelegatedPermissions() != null
                && member.getDelegatedPermissions().contains(permission)) {
            return;
        }
        if (roleGrants(member.getRole(), permission)) return;
        if (member.getExtraRoles() != null
                && member.getExtraRoles().stream().anyMatch(r -> roleGrants(r, permission))) {
            return;
        }
        throw new BusinessException(ErrorCode.FORBIDDEN);
    }

    /**
     * Default permissions implied by a role. Backed by Vietnamese class
     * leadership conventions: lớp trưởng oversees thi đua + trực nhật,
     * lớp phó học tập manages thi đua, sao đỏ records thi đua entries, etc.
     */
    private static boolean roleGrants(ClassroomMember.Role role, ClassroomMember.DelegatedPermission permission) {
        return switch (permission) {
            case MANAGE_EMULATION_CATEGORIES -> role == ClassroomMember.Role.MONITOR
                    || role == ClassroomMember.Role.STUDY_VICE_MONITOR;
            case MANAGE_EMULATION_ENTRIES -> role == ClassroomMember.Role.MONITOR
                    || role == ClassroomMember.Role.VICE_MONITOR
                    || role == ClassroomMember.Role.STUDY_VICE_MONITOR
                    || role == ClassroomMember.Role.DISCIPLINE_OFFICER
                    || role == ClassroomMember.Role.GROUP_LEADER;
            case MANAGE_DUTY_TYPES -> role == ClassroomMember.Role.MONITOR
                    || role == ClassroomMember.Role.LABOR_VICE_MONITOR;
            case MANAGE_DUTY_ASSIGNMENTS -> role == ClassroomMember.Role.MONITOR
                    || role == ClassroomMember.Role.VICE_MONITOR
                    || role == ClassroomMember.Role.LABOR_VICE_MONITOR
                    || role == ClassroomMember.Role.GROUP_LEADER;
            case MANAGE_FUND -> role == ClassroomMember.Role.MONITOR
                    || role == ClassroomMember.Role.TREASURER;
        };
    }

    private static int rankOf(ClassroomMember.Role role) {
        int idx = ROLE_ORDER.indexOf(role);
        // Roles not explicitly ordered (e.g. specialised vice-monitor variants) are
        // treated as equivalent to VICE_MONITOR for ranking purposes.
        if (idx >= 0) return idx;
        return switch (role) {
            case STUDY_VICE_MONITOR, ARTS_VICE_MONITOR, LABOR_VICE_MONITOR ->
                    ROLE_ORDER.indexOf(ClassroomMember.Role.VICE_MONITOR);
            case DISCIPLINE_OFFICER -> ROLE_ORDER.indexOf(ClassroomMember.Role.GROUP_LEADER);
            case SECRETARY -> ROLE_ORDER.indexOf(ClassroomMember.Role.GROUP_LEADER);
            default -> 0;
        };
    }

    private static String generateInviteCode() {
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(INVITE_CODE_CHARS.charAt(SECURE_RANDOM.nextInt(INVITE_CODE_CHARS.length())));
        }
        return sb.toString();
    }
}
