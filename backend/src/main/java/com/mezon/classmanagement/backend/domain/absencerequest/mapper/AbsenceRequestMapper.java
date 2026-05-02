package com.mezon.classmanagement.backend.domain.absencerequest.mapper;

import com.mezon.classmanagement.backend.domain.absencerequest.dto.request.CreateAbsenceRequestRequestDto;
import com.mezon.classmanagement.backend.domain.absencerequest.dto.response.AbsenceRequestResponseDto;
import com.mezon.classmanagement.backend.domain.absencerequest.entity.AbsenceRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AbsenceRequestMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "clazz", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    AbsenceRequest toEntity(CreateAbsenceRequestRequestDto request);

    @Mapping(source = "clazz.id", target = "classId")
    @Mapping(source = "user.id", target = "userId")
    AbsenceRequestResponseDto toResponse(AbsenceRequest entity);

}
