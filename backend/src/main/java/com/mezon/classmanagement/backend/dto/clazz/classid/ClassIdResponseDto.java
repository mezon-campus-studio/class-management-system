package com.mezon.classmanagement.backend.dto.clazz.classid;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Builder
public final class ClassIdResponseDto {
	@JsonProperty(value = "class_id")
	Long classId;
}