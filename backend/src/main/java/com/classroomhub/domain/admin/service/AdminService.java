package com.classroomhub.domain.admin.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.admin.dto.AdminClassroomResponse;
import com.classroomhub.domain.admin.dto.AdminMetricsResponse;
import com.classroomhub.domain.admin.dto.AdminUserResponse;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.classroom.entity.Classroom;
import com.classroomhub.domain.classroom.repository.ClassroomMemberRepository;
import com.classroomhub.domain.classroom.repository.ClassroomRepository;
import com.classroomhub.domain.parent.repository.ParentLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassroomMemberRepository memberRepository;
    private final ParentLinkRepository parentLinkRepository;

    public AdminMetricsResponse getMetrics() {
        return new AdminMetricsResponse(
                userRepository.count(),
                userRepository.countByUserType(User.UserType.STUDENT),
                userRepository.countByUserType(User.UserType.TEACHER),
                userRepository.countByUserType(User.UserType.PARENT),
                userRepository.countByUserType(User.UserType.SYSTEM_ADMIN),
                classroomRepository.count(),
                classroomRepository.findAll().stream()
                        .filter(c -> c.getStatus() == Classroom.Status.ACTIVE).count(),
                parentLinkRepository.count()
        );
    }

    public Page<AdminUserResponse> listUsers(String q, User.UserType type, int page, int size) {
        String query = q == null ? "" : q.trim();
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.searchUsersPage(query, type, pageable)
                .map(AdminUserResponse::from);
    }

    public Page<AdminClassroomResponse> listClassrooms(int page, int size) {
        var pageable = PageRequest.of(page, size);
        Page<Classroom> classroomPage = classroomRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<UUID> ownerIds = classroomPage.getContent().stream()
                .map(Classroom::getOwnerId).distinct().toList();
        Map<UUID, String> ownerNames = userRepository.findAllById(ownerIds).stream()
                .collect(Collectors.toMap(User::getId, User::getDisplayName));

        List<UUID> classroomIds = classroomPage.getContent().stream()
                .map(Classroom::getId).toList();
        Map<UUID, Integer> memberCounts = memberRepository.countMapByClassroomIds(classroomIds);

        return classroomPage.map(c -> new AdminClassroomResponse(
                c.getId(), c.getName(), c.getDescription(),
                c.getOwnerId(),
                ownerNames.getOrDefault(c.getOwnerId(), "(unknown)"),
                memberCounts.getOrDefault(c.getId(), 0),
                c.getMaxMembers(), c.getStatus(), c.getCreatedAt()));
    }

    @Transactional
    public AdminUserResponse setUserStatus(UUID userId, User.Status status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN));
        if (user.getUserType() == User.UserType.SYSTEM_ADMIN && status != User.Status.ACTIVE) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        user.setStatus(status);
        userRepository.save(user);
        return AdminUserResponse.from(user);
    }

    @Transactional
    public void archiveClassroom(UUID classroomId) {
        Classroom c = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CLASSROOM_NOT_FOUND));
        c.setStatus(Classroom.Status.ARCHIVED);
        classroomRepository.save(c);
    }
}
