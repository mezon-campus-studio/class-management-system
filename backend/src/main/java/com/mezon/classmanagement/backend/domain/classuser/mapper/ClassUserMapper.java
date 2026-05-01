package com.mezon.classmanagement.backend.domain.classuser.mapper;

import com.mezon.classmanagement.backend.domain.classuser.dto.ClassUserResponseDto;
import com.mezon.classmanagement.backend.domain.classuser.entity.ClassUser;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ClassUserMapper {
	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
	<T> void updateClassUserFromRequestDto(T updateClassUserRequestDto, @MappingTarget ClassUser classUser);

	@Mapping(source = "clazz.id", target = "classId")
	@Mapping(source = "user.id", target = "userId")
	ClassUserResponseDto toClassUserResponseDto(ClassUser classUser);
}