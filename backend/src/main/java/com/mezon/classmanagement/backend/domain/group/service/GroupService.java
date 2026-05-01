package com.mezon.classmanagement.backend.domain.group.service;

import com.mezon.classmanagement.backend.common.constant.WarningConstant;
import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.common.security.annotation.RequireClassPermission;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import com.mezon.classmanagement.backend.domain.group.dto.CreateAndUpdateGroupRequestDto;
import com.mezon.classmanagement.backend.domain.group.dto.GroupIdResponseDto;
import com.mezon.classmanagement.backend.domain.group.dto.GroupResponseDto;
import com.mezon.classmanagement.backend.domain.group.entity.Group;
import com.mezon.classmanagement.backend.domain.group.mapper.GroupMapper;
import com.mezon.classmanagement.backend.domain.group.repository.GroupRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    @RequireClassPermission
    @Transactional
    public GroupResponseDto createGroup(Long classId, CreateAndUpdateGroupRequestDto request) {
        Class clazz = Class.builder()
                .id(classId)
                .build();

        Group newGroup = groupMapper.toGroup(request);
        newGroup.setClazz(clazz);

        Group responseGroup = save(newGroup);

        return groupMapper.toGroupResponseDto(responseGroup);
    }

    @RequireClassPermission
    @Transactional
    public GroupResponseDto updateGroup(Long classId, Long groupId, CreateAndUpdateGroupRequestDto request) {
        Group currentGroup = findByClassIdAndGroupIdOrThrow(classId, groupId);

        groupMapper.updateGroupFromRequestDto(request, currentGroup);

        Group responseGroup = save(currentGroup);

        return groupMapper.toGroupResponseDto(responseGroup);
    }

    @RequireClassPermission
    @Transactional
    public GroupIdResponseDto deleteGroup(Long classId, Long groupId) {
        Group currentGroup = findByClassIdAndGroupIdOrThrow(classId, groupId);

        delete(currentGroup);

        return GroupIdResponseDto.builder()
                .groupId(currentGroup.getId())
                .build();
    }

    @RequireClassPermission
    @Transactional(readOnly = true)
    public List<GroupResponseDto> getGroups(Long classId) {
        return findByClassId(classId).stream()
                .map(groupMapper::toGroupResponseDto)
                .toList();
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

    @Transactional(readOnly = true)
    public List<Group> findByClassId(Long classId) {
        return groupRepository
                .findByClazz_Id(classId);
    }

    @Transactional(readOnly = true)
    public Group findByClassIdAndGroupIdOrThrow(Long classId, Long groupId) {
        return groupRepository
                .findByClazz_IdAndId(classId, groupId)
                .orElseThrow(() ->
                        new GlobalException(GlobalException.Type.NOT_FOUND, "Group not found")
                );
    }

    /**
     * Exists
     */

    @Transactional(readOnly = true)
    public boolean existsByClassIdAndGroupId(Long classId, Long groupId) {
        return groupRepository.existsByClazz_IdAndId(classId, groupId);
    }

    @Transactional(readOnly = true)
    public void throwIfNotExistsByClassIdAndGroupId(Long classId, Long groupId) {
        if (!existsByClassIdAndGroupId(classId, groupId)) {
            throw new GlobalException(GlobalException.Type.NOT_FOUND, "Group not found");
        }
    }

}