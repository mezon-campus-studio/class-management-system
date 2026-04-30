package com.mezon.classmanagement.backend.domain.group.service;

import com.mezon.classmanagement.backend.common.security.annotation.RequireClassPermission;
import com.mezon.classmanagement.backend.common.constant.WarningConstant;
import com.mezon.classmanagement.backend.domain.group.dto.CreateAndUpdateGroupRequestDto;
import com.mezon.classmanagement.backend.domain.group.dto.GroupResponseDto;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import com.mezon.classmanagement.backend.domain.group.entity.Group;
import com.mezon.classmanagement.backend.domain.auth.entity.User;
import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.domain.group.mapper.GroupMapper;
import com.mezon.classmanagement.backend.domain.group.repository.GroupRepository;
import com.mezon.classmanagement.backend.domain.clazz.service.ClassService;
import com.mezon.classmanagement.backend.domain.auth.service.UserService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@SuppressWarnings({WarningConstant.BOOLEAN_METHOD_IS_ALWAYS_INVERTED})
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class GroupService {

    /**
     * Repository
     */

    GroupRepository groupRepository;

    /**
     * Mapper
     */

    GroupMapper groupMapper;

    /**
     * Other services
     */

    ClassService classService;
    UserService userService;

    @RequireClassPermission
    @Transactional
    public GroupResponseDto createGroup(Long classId, CreateAndUpdateGroupRequestDto request) {
        classService.throwIfNotExistsById(classId);
        userService.throwIfNotExistsById(request.getLeaderUserId());

        Class clazz = Class.builder()
                .id(classId)
                .build();
        User leader = User.builder()
                .id(request.getLeaderUserId())
                .build();
        Group newGroup = groupMapper.toGroup(request);
        newGroup.setClazz(clazz);
        newGroup.setLeader(leader);

        Group responseGroup = save(newGroup);

        return groupMapper.toCreateGroupResponseDto(responseGroup);
    }

    @RequireClassPermission
    @Transactional
    public GroupResponseDto updateGroup(Long classId, Long groupId, CreateAndUpdateGroupRequestDto request) {
        throwIfNotExistsByClassIdAndGroupId(classId, groupId);

        Group currentGroup = findByIdOrThrow(groupId);

        groupMapper.updateGroupFromRequestDto(request, currentGroup);

        Group responseGroup = save(currentGroup);

        return groupMapper.toUpdateGroupResponseDto(responseGroup);
    }

    @RequireClassPermission
    @Transactional
    public void deleteGroup(Long classId, Long groupId) {
        throwIfNotExistsByClassIdAndGroupId(classId, groupId);

        Group currentGroup = findByIdOrThrow(groupId);

        delete(currentGroup);
    }

    /**
     * Action
     */

    @Transactional
    public Group save(Group group) {
        return groupRepository.save(group);
    }

    @Transactional
    public void delete(Group group) {
        groupRepository.delete(group);
    }

    /**
     * Find
     */

    @Transactional
    public Group findByIdOrThrow(Long id) {
        return groupRepository
                .findById(id)
                .orElseThrow(() ->
                        new GlobalException(GlobalException.Type.NOT_FOUND, "Group not found")
                );
    }

    /**
     * Exists
     */

    @Transactional
    public boolean existsByClassIdAndGroupId(Long classId, Long groupId) {
        return groupRepository.existsByClazz_IdAndId(classId, groupId);
    }

    @Transactional
    public void throwIfNotExistsByClassIdAndGroupId(Long classId, Long groupId) {
        if (!existsByClassIdAndGroupId(classId, groupId)) {
            throw new GlobalException(GlobalException.Type.NOT_FOUND, "Group not found");
        }
    }

}