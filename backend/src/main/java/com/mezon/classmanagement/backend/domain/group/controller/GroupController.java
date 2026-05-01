package com.mezon.classmanagement.backend.domain.group.controller;

import com.mezon.classmanagement.backend.common.dto.ResponseDTO;
import com.mezon.classmanagement.backend.domain.group.dto.CreateAndUpdateGroupRequestDto;
import com.mezon.classmanagement.backend.domain.group.dto.GroupIdResponseDto;
import com.mezon.classmanagement.backend.domain.group.dto.GroupResponseDto;
import com.mezon.classmanagement.backend.domain.group.service.GroupService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/classes/{classId}/groups")
@RestController
public class GroupController {

    GroupService groupService;

    @PreAuthorize("@ClassPermission.manageGroup(#classId)")
    @PostMapping
    public ResponseDTO<GroupResponseDto> createGroup(
            @PathVariable Long classId,
            @RequestBody CreateAndUpdateGroupRequestDto request
    ) {
        GroupResponseDto response = groupService.createGroup(classId, request);

        return ResponseDTO.<GroupResponseDto>builder()
                .success(true)
                .message("Create group successful")
                .data(response)
                .build();
    }

    @PreAuthorize("@ClassPermission.manageGroupData(#classId, #groupId)")
    @PatchMapping("/{groupId}")
    public ResponseDTO<GroupResponseDto> updateGroup(
            @PathVariable Long classId,
            @PathVariable Long groupId,
            @RequestBody CreateAndUpdateGroupRequestDto request
    ) {
        GroupResponseDto response = groupService.updateGroup(classId, groupId, request);

        return ResponseDTO.<GroupResponseDto>builder()
                .success(true)
                .message("Update group successful")
                .data(response)
                .build();
    }

    @PreAuthorize("@ClassPermission.manageGroupData(#classId, #groupId)")
    @DeleteMapping("/{groupId}")
    public ResponseDTO<GroupIdResponseDto> deleteGroup(
            @PathVariable Long classId,
            @PathVariable Long groupId
    ) {
        GroupIdResponseDto response = groupService.deleteGroup(classId, groupId);

        return ResponseDTO.<GroupIdResponseDto>builder()
                .success(true)
                .message("Delete group successful")
                .data(response)
                .build();
    }

    @PreAuthorize("@ClassPermission.everyoneInClass(#classId)")
    @GetMapping
    public ResponseDTO<List<GroupResponseDto>> getGroups(
            @PathVariable Long classId
    ) {
        List<GroupResponseDto> response = groupService.getGroups(classId);

        return ResponseDTO.<List<GroupResponseDto>>builder()
                .success(true)
                .message("Get groups successful")
                .data(response)
                .build();
    }

}