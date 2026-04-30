package com.mezon.classmanagement.backend.domain.groupuser.controller;

import com.mezon.classmanagement.backend.common.dto.ResponseDTO;
import com.mezon.classmanagement.backend.domain.groupuser.dto.request.UpdateGroupUserRequestDto;
import com.mezon.classmanagement.backend.domain.groupuser.dto.response.GroupUserIdResponseDto;
import com.mezon.classmanagement.backend.domain.groupuser.dto.response.GroupUserResponseDto;
import com.mezon.classmanagement.backend.domain.groupuser.entity.GroupUser;
import com.mezon.classmanagement.backend.domain.groupuser.service.GroupUserService;
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
@RequestMapping("/api/classes/{classId}/groups/{groupId}/groupusers")
@RestController
public class GroupUserController {

	GroupUserService groupUserService;

	@PreAuthorize("@ClassPermission.manageGroupData(#classId, #groupId)")
	@PostMapping("/member/{userId}")
	public ResponseDTO<GroupUserResponseDto> createGroupUserAsMember(
			@PathVariable Long classId,
			@PathVariable Long groupId,
			@PathVariable Long userId
	) {
		GroupUserResponseDto response = groupUserService.createGroupUser(classId, groupId, userId, GroupUser.Role.GROUP_MEMBER);

		return ResponseDTO.<GroupUserResponseDto>builder()
				.success(true)
				.message("Create group user successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.manageGroup(#classId)")
	@PostMapping("/leader/{userId}")
	public ResponseDTO<GroupUserResponseDto> createGroupUserAsLeader(
			@PathVariable Long classId,
			@PathVariable Long groupId,
			@PathVariable Long userId
	) {
		GroupUserResponseDto response = groupUserService.createGroupUser(classId, groupId, userId, GroupUser.Role.GROUP_LEADER);

		return ResponseDTO.<GroupUserResponseDto>builder()
				.success(true)
				.message("Create group user successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.manageGroupData(#classId, #groupId)")
	@PatchMapping("/{userId}")
	public ResponseDTO<GroupUserResponseDto> updateGroupUser(
			@PathVariable Long classId,
			@PathVariable Long groupId,
			@PathVariable Long userId,
			@RequestBody UpdateGroupUserRequestDto request
	) {
		GroupUserResponseDto response = groupUserService.updateGroupUser(classId, groupId, userId, request);

		return ResponseDTO.<GroupUserResponseDto>builder()
				.success(true)
				.message("Update group user successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.manageGroupData(#classId, #groupId)")
	@DeleteMapping("/{userId}")
	public ResponseDTO<GroupUserIdResponseDto> deleteGroupUser(
			@PathVariable Long classId,
			@PathVariable Long groupId,
			@PathVariable Long userId
	) {
		GroupUserIdResponseDto response = groupUserService.deleteGroupUser(classId, groupId, userId);

		return ResponseDTO.<GroupUserIdResponseDto>builder()
				.success(true)
				.message("Delete group user successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.isClassUser(#classId)")
	@GetMapping
	public ResponseDTO<List<GroupUserResponseDto>> getGroupUsers(
			@PathVariable Long classId,
			@PathVariable Long groupId
	) {
		List<GroupUserResponseDto> response = groupUserService.getGroupUsers(classId, groupId);

		return ResponseDTO.<List<GroupUserResponseDto>>builder()
				.success(true)
				.message("Get group users successful")
				.data(response)
				.build();
	}

}