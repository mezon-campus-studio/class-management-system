package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.annotation.RequireClassPermission;
import com.mezon.classmanagement.backend.constant.WarningConstant;
import com.mezon.classmanagement.backend.dto.group.CreateAndUpdateGroupRquestDto;
import com.mezon.classmanagement.backend.dto.group.GroupIdResponseDto;
import com.mezon.classmanagement.backend.dto.group.Groupdto;
import com.mezon.classmanagement.backend.entity.Group;
import com.mezon.classmanagement.backend.entity.User;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.mapper.GroupMapper;
import com.mezon.classmanagement.backend.repository.GroupRepository;
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
    public Groupdto createGroup(Long classId, CreateAndUpdateGroupRquestDto request) {
        classService.throwIfNotExistsById(classId);
        userService.throwIfNotExistsById(request.getLeaderUserId());

        com.mezon.classmanagement.backend.entity.Class clazz =
                com.mezon.classmanagement.backend.entity.Class.builder()
                        .id(classId)
                        .build();
        User leader = User.builder()
                .id(request.getLeaderUserId())
                .build();

        Group newGroup = groupMapper.toGroup(request);
        newGroup.setClazz(clazz);
        newGroup.setLeader(leader);

        Group savedGroup = save(newGroup);

        return groupMapper.toCreateGroupResponseDto(savedGroup);
    }

    @RequireClassPermission
    @Transactional
    public Groupdto updateGroup(Long classId, Long groupId, CreateAndUpdateGroupRquestDto request) {
        Group currentGroup = findByIdOrThrow(groupId);

        throwIfGroupNotBelongsToClass(currentGroup, classId);

        if (request.getLeaderUserId() != null) {
            userService.throwIfNotExistsById(request.getLeaderUserId());
            User newLeader = User.builder()
                    .id(request.getLeaderUserId())
                    .build();
            currentGroup.setLeader(newLeader);
        }

        groupMapper.updateGroupFromRequestDto(request, currentGroup);

        Group savedGroup = save(currentGroup);

        return groupMapper.toUpdateGroupResponseDto(savedGroup);
    }

    @RequireClassPermission
    @Transactional
    public GroupIdResponseDto deleteGroup(Long classId, Long groupId) {
        Group currentGroup = findByIdOrThrow(groupId);

        throwIfGroupNotBelongsToClass(currentGroup, classId);

        delete(currentGroup);

        return GroupIdResponseDto.builder()
                .groupId(groupId)
                .build();
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
    public boolean existsById(Long id) {
        return groupRepository.existsById(id);
    }

    @Transactional
    public void throwIfNotExistsById(Long id) {
        if (!existsById(id)) {
            throw new GlobalException(GlobalException.Type.NOT_FOUND, "Group not found");
        }
    }

    /**
     * Validation
     */

    public void throwIfGroupNotBelongsToClass(Group group, Long classId) {
        if (!group.getClazz().getId().equals(classId)) {
            throw new GlobalException(GlobalException.Type.FORBIDDEN, "Group does not belong to this class");
        }
    }
}