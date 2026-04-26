package com.mezon.classmanagement.backend.mapper;

import com.mezon.classmanagement.backend.dto.activity.response.ActivityResponseDto;
import com.mezon.classmanagement.backend.dto.activity.request.CreateAndUpdateActivityRequestDto;
import com.mezon.classmanagement.backend.entity.Activity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ActivityMapper {
	Activity toActivity(CreateAndUpdateActivityRequestDto createAndUpdateActivityRequestDto);

	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
	void updateActivityFromRequestDto(CreateAndUpdateActivityRequestDto request, @MappingTarget Activity activity);

	@Mapping(source = "clazz.id", target = "classId")
	ActivityResponseDto toCreateActivityResponseDto(Activity activity);

	@Mapping(source = "clazz.id", target = "classId")
	ActivityResponseDto toUpdateActivityResponseDto(Activity activity);
}