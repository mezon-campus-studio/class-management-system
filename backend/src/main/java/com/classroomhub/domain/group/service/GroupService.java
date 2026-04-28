package com.classroomhub.domain.group.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.repository.ClassroomMemberRepository;
import com.classroomhub.domain.classroom.service.ClassroomService;
import com.classroomhub.domain.group.dto.*;
import com.classroomhub.domain.group.entity.Group;
import com.classroomhub.domain.group.entity.GroupMember;
import com.classroomhub.domain.group.repository.GroupMemberRepository;
import com.classroomhub.domain.group.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ClassroomMemberRepository classroomMemberRepository;
    private final ClassroomService classroomService;
    private final UserRepository userRepository;

    @Transactional
    public GroupResponse create(UUID classroomId, UUID requesterId, CreateGroupRequest req) {
        classroomService.requireRoleAtLeast(classroomId, requesterId, ClassroomMember.Role.TEACHER);

        Group group = Group.builder()
                .classroomId(classroomId)
                .name(req.name())
                .description(req.description())
                .build();
        groupRepository.save(group);
        return GroupResponse.from(group, List.of());
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> listByClassroom(UUID classroomId, UUID requesterId) {
        classroomService.requireMember(classroomId, requesterId);
        List<Group> groups = groupRepository.findAllByClassroomId(classroomId);
        return groups.stream().map(g -> {
            List<GroupMemberResponse> members = buildMemberResponses(g.getId());
            return GroupResponse.from(g, members);
        }).toList();
    }

    @Transactional(readOnly = true)
    public GroupResponse get(UUID classroomId, UUID groupId, UUID requesterId) {
        classroomService.requireMember(classroomId, requesterId);
        Group group = requireGroup(groupId, classroomId);
        return GroupResponse.from(group, buildMemberResponses(groupId));
    }

    @Transactional
    public GroupResponse update(UUID classroomId, UUID groupId, UUID requesterId, CreateGroupRequest req) {
        classroomService.requireRoleAtLeast(classroomId, requesterId, ClassroomMember.Role.TEACHER);
        Group group = requireGroup(groupId, classroomId);
        if (req.name() != null) group.setName(req.name());
        if (req.description() != null) group.setDescription(req.description());
        groupRepository.save(group);
        return GroupResponse.from(group, buildMemberResponses(groupId));
    }

    @Transactional
    public void delete(UUID classroomId, UUID groupId, UUID requesterId) {
        classroomService.requireRoleAtLeast(classroomId, requesterId, ClassroomMember.Role.TEACHER);
        Group group = requireGroup(groupId, classroomId);
        groupMemberRepository.deleteAllByGroupId(groupId);
        groupRepository.delete(group);
    }

    @Transactional
    public GroupResponse addMember(UUID classroomId, UUID groupId, UUID requesterId, AddGroupMemberRequest req) {
        classroomService.requireRoleAtLeast(classroomId, requesterId, ClassroomMember.Role.TEACHER);
        Group group = requireGroup(groupId, classroomId);

        ClassroomMember classroomMember = classroomMemberRepository.findById(req.classroomMemberId())
                .filter(m -> m.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (groupMemberRepository.existsByClassroomMemberId(req.classroomMemberId())) {
            throw new BusinessException(ErrorCode.MEMBER_ALREADY_IN_GROUP);
        }

        GroupMember gm = GroupMember.builder()
                .groupId(groupId)
                .classroomMemberId(req.classroomMemberId())
                .userId(classroomMember.getUserId())
                .build();
        groupMemberRepository.save(gm);
        return GroupResponse.from(group, buildMemberResponses(groupId));
    }

    @Transactional
    public void removeMember(UUID classroomId, UUID groupId, UUID groupMemberId, UUID requesterId) {
        classroomService.requireRoleAtLeast(classroomId, requesterId, ClassroomMember.Role.TEACHER);
        requireGroup(groupId, classroomId);

        GroupMember gm = groupMemberRepository.findById(groupMemberId)
                .filter(m -> m.getGroupId().equals(groupId))
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        groupMemberRepository.delete(gm);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private Group requireGroup(UUID groupId, UUID classroomId) {
        return groupRepository.findById(groupId)
                .filter(g -> g.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));
    }

    private List<GroupMemberResponse> buildMemberResponses(UUID groupId) {
        List<GroupMember> members = groupMemberRepository.findAllByGroupId(groupId);
        List<UUID> userIds = members.stream().map(GroupMember::getUserId).toList();
        Map<UUID, User> users = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        return members.stream()
                .map(m -> {
                    User u = users.get(m.getUserId());
                    return new GroupMemberResponse(m.getId(), m.getUserId(),
                            u != null ? u.getDisplayName() : "",
                            u != null ? u.getAvatarUrl() : null,
                            m.getJoinedAt());
                })
                .toList();
    }
}
