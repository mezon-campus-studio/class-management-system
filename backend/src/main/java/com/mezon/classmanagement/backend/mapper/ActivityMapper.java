package com.mezon.classmanagement.backend.mapper;

import com.mezon.classmanagement.backend.dto.request.CreateActivityRequestDto;
import com.mezon.classmanagement.backend.dto.request.UpdateActivityRequestDto;
import com.mezon.classmanagement.backend.entity.Activity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ActivityMapper {
	Activity toActivity(CreateActivityRequestDto createActivityRequestDto);
	Activity toActivity(UpdateActivityRequestDto updateActivityRequestDto);
}