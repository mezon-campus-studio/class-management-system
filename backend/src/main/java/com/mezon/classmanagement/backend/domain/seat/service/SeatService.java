package com.mezon.classmanagement.backend.domain.seat.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mezon.classmanagement.backend.domain.group.entity.Group;
import com.mezon.classmanagement.backend.domain.group.service.GroupService;
import com.mezon.classmanagement.backend.domain.groupuser.dto.request.UpdateGroupUserSeatRequestDto;
import com.mezon.classmanagement.backend.domain.groupuser.dto.response.GroupUserResponseDto;
import com.mezon.classmanagement.backend.domain.groupuser.entity.GroupUser;
import com.mezon.classmanagement.backend.domain.groupuser.service.GroupUserService;
import com.mezon.classmanagement.backend.domain.seat.dto.ClassSeatResponseDto;
import com.mezon.classmanagement.backend.domain.seat.dto.DeskPositionSeatResponseDto;
import com.mezon.classmanagement.backend.domain.seat.dto.DeskSeatResponseDto;
import com.mezon.classmanagement.backend.domain.seat.dto.GroupSeatResponseDto;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class SeatService {

	/**
	 * Service
	 */

	GroupService groupService;
	GroupUserService groupUserService;

	@Transactional
	public ClassSeatResponseDto updateClassSeats(
			Long classId,
			Long userId,
			UpdateGroupUserSeatRequestDto request
	) {
		Group targetGroup = groupService.findByClassIdAndGroupIdOrThrow(classId, request.getTargetGroupId());

		GroupUser sourceGroupUser = groupUserService
				.findByClassIdAndGroupIdAndDeskAndDeskPositionOrThrow(
						classId,
						request.getSourceGroupId(),
						request.getSourceDesk(),
						request.getSourceDeskPosition()
				);

		if (groupUserService.existsByClassIdAndGroupIdAndDeskAndDeskPosition(
				classId,
				request.getTargetGroupId(),
				request.getTargetDesk(),
				request.getTargetDeskPosition()
		)) {
			GroupUser targetGroupUser = groupUserService
					.findByClassIdAndGroupIdAndDeskAndDeskPositionOrThrow(
							classId,
							request.getTargetGroupId(),
							request.getTargetDesk(),
							request.getTargetDeskPosition()
					);
			swap(sourceGroupUser, targetGroupUser);

			groupUserService.save(sourceGroupUser);
			groupUserService.save(targetGroupUser);
		} else {
			set(
					sourceGroupUser,
					targetGroup,
					request.getTargetDesk(),
					request.getTargetDeskPosition()
			);

			groupUserService.save(sourceGroupUser);
		}

		return getClassSeats(classId);
	}

	private void set(GroupUser groupUser, Group newGroup, Short newDesk, Short newDeskPosition) {
		groupUser.setGroup(newGroup);
		groupUser.setDesk(newDesk);
		groupUser.setDeskPosition(newDeskPosition);
	}

	private void swap(GroupUser source, GroupUser target) {
		Group tempGroup = source.getGroup();
		Short tempDesk = source.getDesk();
		Short tempDeskPosition = source.getDeskPosition();

		set(source, target.getGroup(), target.getDesk(), target.getDeskPosition());
		set(target, tempGroup, tempDesk, tempDeskPosition);
	}

	@Transactional(readOnly = true)
	public ClassSeatResponseDto getClassSeats2(Long classId) {
		List<GroupUserResponseDto> groupUserList = groupUserService.findByClassId(classId);

		// from ClassSeat
		List<LinkedHashMap<Long, GroupSeatResponseDto>> groups = new ArrayList<>();

		Long currentGroupId = null;
		Short currentDesk = null;

		// from GroupSeat
		List<LinkedHashMap<Short, DeskSeatResponseDto>> currentDesks = null;
		// from DeskSeat
		List<LinkedHashMap<Short, DeskPositionSeatResponseDto>> currentDeskPositions = null;

		for (GroupUserResponseDto groupUser : groupUserList) {

			if (!Objects.equals(currentGroupId, groupUser.getGroupId())) {

				currentGroupId = groupUser.getGroupId();
				currentDesk = null;

				currentDesks = new ArrayList<>();

				GroupSeatResponseDto groupDto = GroupSeatResponseDto.builder()
						.desks(currentDesks)
						.build();

				LinkedHashMap<Long, GroupSeatResponseDto> groupMap = new LinkedHashMap<>();
				groupMap.put(currentGroupId, groupDto);

				groups.add(groupMap);
			}

			if (!Objects.equals(currentDesk, groupUser.getDesk())) {

				currentDesk = groupUser.getDesk();

				currentDeskPositions = new ArrayList<>();

				DeskSeatResponseDto deskDto = DeskSeatResponseDto.builder()
						.deskPositions(currentDeskPositions)
						.build();

				LinkedHashMap<Short, DeskSeatResponseDto> deskMap = new LinkedHashMap<>();
				deskMap.put(currentDesk, deskDto);

				currentDesks.add(deskMap);
			}

			DeskPositionSeatResponseDto seatDto = DeskPositionSeatResponseDto.builder()
					.userId(groupUser.getUserId())
					.userDisplayName(groupUser.getUserDisplayName())
					.build();

			LinkedHashMap<Short, DeskPositionSeatResponseDto> deskPositionMap = new LinkedHashMap<>();
			deskPositionMap.put(groupUser.getDeskPosition(), seatDto);

			currentDeskPositions.add(deskPositionMap);
		}

		return ClassSeatResponseDto.builder()
				.groups(groups)
				.build();
	}

	@Transactional(readOnly = true)
	public ClassSeatResponseDto getClassSeats(Long classId) {

		List<GroupUserResponseDto> groupUserList = groupUserService.findByClassId(classId);

		// Group theo groupId -> desk -> deskPosition
		Map<
			Long,
			Map<
				Short,
				Map<
					Short,
					GroupUserResponseDto
				>
			>
		> seatMap = new HashMap<>();

		for (GroupUserResponseDto groupUser : groupUserList) {

			seatMap
					.computeIfAbsent(groupUser.getGroupId(), k -> new HashMap<>())
					.computeIfAbsent(groupUser.getDesk(), k -> new HashMap<>())
					.put(groupUser.getDeskPosition(), groupUser);
		}

		List<LinkedHashMap<Long, GroupSeatResponseDto>> groups = new ArrayList<>();

		// luôn tạo đủ 4 group
		for (long groupId = 1; groupId <= 4; groupId++) {

			List<LinkedHashMap<Short, DeskSeatResponseDto>> desks = new ArrayList<>();

			Map<Short, Map<Short, GroupUserResponseDto>> groupData =
					seatMap.getOrDefault(groupId, Collections.emptyMap());

			// luôn tạo đủ 10 desk
			for (short desk = 1; desk <= 10; desk++) {

				List<LinkedHashMap<Short, DeskPositionSeatResponseDto>> deskPositions =
						new ArrayList<>();

				Map<Short, GroupUserResponseDto> deskData =
						groupData.getOrDefault(desk, Collections.emptyMap());

				// ví dụ mỗi bàn có 2 chỗ ngồi: 1 và 2
				for (short position = 1; position <= 2; position++) {

					GroupUserResponseDto user = deskData.get(position);

					DeskPositionSeatResponseDto seatDto = null;

					if (user != null) {
						seatDto = DeskPositionSeatResponseDto.builder()
								.userId(user.getUserId())
								.userDisplayName(user.getUserDisplayName())
								.build();
					}

					LinkedHashMap<Short, DeskPositionSeatResponseDto> positionMap =
							new LinkedHashMap<>();

					positionMap.put(position, seatDto);

					deskPositions.add(positionMap);
				}

				DeskSeatResponseDto deskDto = DeskSeatResponseDto.builder()
						.deskPositions(deskPositions)
						.build();

				LinkedHashMap<Short, DeskSeatResponseDto> deskMap =
						new LinkedHashMap<>();

				deskMap.put(desk, deskDto);

				desks.add(deskMap);
			}

			GroupSeatResponseDto groupDto = GroupSeatResponseDto.builder()
					.desks(desks)
					.build();

			LinkedHashMap<Long, GroupSeatResponseDto> groupMap =
					new LinkedHashMap<>();

			groupMap.put(groupId, groupDto);

			groups.add(groupMap);
		}

		return ClassSeatResponseDto.builder()
				.groups(groups)
				.build();
	}

}