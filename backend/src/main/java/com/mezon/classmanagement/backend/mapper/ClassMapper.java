package com.mezon.classmanagement.backend.mapper;

import com.mezon.classmanagement.backend.dto.clazz.ClassDto;
import com.mezon.classmanagement.backend.dto.clazz.createandupdate.CreateAndUpdateClassRequestDto;
import com.mezon.classmanagement.backend.entity.Class;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ClassMapper {

	/**
	 * Map Request to Entity
	 */

	Class toClass(CreateAndUpdateClassRequestDto request);

	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
	void updateClassFromRequestDto(CreateAndUpdateClassRequestDto request, @MappingTarget Class entity);

	/**
	 * Map Entity to Response
	 */

	@Mapping(source = "owner.id", target = "ownerUserId")
	ClassDto toCreateClassResponseDto(Class clazz);

	@Mapping(source = "owner.id", target = "ownerUserId")
	ClassDto toUpdateClassResponseDto(Class clazz);

	@Mappings({
			@Mapping(target = "ownerUserId", ignore = true),
			@Mapping(target = "description", ignore = true),
			@Mapping(target = "code", ignore = true),
			@Mapping(target = "privacy", ignore = true)
	})
	ClassDto toJoinClassResponseDto(Class clazz);
}