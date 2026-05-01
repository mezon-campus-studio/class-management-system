package com.mezon.classmanagement.backend.domain.groupuser.controller;

import com.mezon.classmanagement.backend.common.dto.ResponseDTO;
import com.mezon.classmanagement.backend.domain.groupuser.dto.request.CreateGroupUserRequestDto;
import com.mezon.classmanagement.backend.domain.groupuser.dto.request.UpdateGroupUserRoleRequestDto;
import com.mezon.classmanagement.backend.domain.groupuser.dto.response.GroupUserIdResponseDto;
import com.mezon.classmanagement.backend.domain.groupuser.dto.response.GroupUserResponseDto;
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
@RequestMapping("/api/classes/{classId}/groups/{groupId}/members")
@RestController
public class GroupUserController {

	GroupUserService groupUserService;

	@PreAuthorize("@ClassPermission.manageGroupData(#classId, #groupId)")
	@PostMapping
	public ResponseDTO<GroupUserResponseDto> createGroupUser(
			@PathVariable Long classId,
			@PathVariable Long groupId,
			@RequestBody CreateGroupUserRequestDto request
	) {
		GroupUserResponseDto response = groupUserService.createGroupUser(classId, groupId, request);

		return ResponseDTO.<GroupUserResponseDto>builder()
				.success(true)
				.message("Create group user successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.manageGroup(#classId)")
	@PatchMapping("/{userId}/role")
	public ResponseDTO<GroupUserResponseDto> updateGroupUser(
			@PathVariable Long classId,
			@PathVariable Long groupId,
			@PathVariable Long userId,
			@RequestBody UpdateGroupUserRoleRequestDto request
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

	@PreAuthorize("@ClassPermission.everyoneInClass(#classId)")
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