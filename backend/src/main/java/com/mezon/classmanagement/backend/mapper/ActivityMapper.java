package com.mezon.classmanagement.backend.mapper;

import com.mezon.classmanagement.backend.dto.activity.create.CreateActivityRequestDto;
import com.mezon.classmanagement.backend.dto.activity.create.CreateActivityResponseDto;
import com.mezon.classmanagement.backend.dto.activity.update.UpdateActivityRequestDto;
import com.mezon.classmanagement.backend.dto.activity.update.UpdateActivityResponseDto;
import com.mezon.classmanagement.backend.entity.Activity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ActivityMapper {
	Activity toActivity(CreateActivityRequestDto createActivityRequestDto);
	Activity toActivity(UpdateActivityRequestDto updateActivityRequestDto);

	@Mapping(source = "clazz.id", target = "classId")
	CreateActivityResponseDto toCreateActivityResponseDto(Activity activity);
	@Mapping(source = "clazz.id", target = "classId")
	UpdateActivityResponseDto toUpdateActivityResponseDto(Activity activity);
}