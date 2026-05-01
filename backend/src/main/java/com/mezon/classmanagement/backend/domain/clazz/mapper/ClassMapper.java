package com.mezon.classmanagement.backend.domain.clazz.mapper;

import com.mezon.classmanagement.backend.domain.clazz.dto.ClassResponseDto;
import com.mezon.classmanagement.backend.domain.clazz.dto.createandupdate.CreateAndUpdateClassRequestDto;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
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
	ClassResponseDto toClassResponseDto(Class clazz);
}