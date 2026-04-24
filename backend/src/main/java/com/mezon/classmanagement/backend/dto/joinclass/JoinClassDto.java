package com.mezon.classmanagement.backend.dto.joinclass;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Builder
public final class JoinClassDto {
	@JsonProperty(value = "class_id")
	Long classId;
}