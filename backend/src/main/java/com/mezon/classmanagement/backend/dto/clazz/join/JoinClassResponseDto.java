package com.mezon.classmanagement.backend.dto.clazz.join;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@JsonPropertyOrder(value = {"class_id"})
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Builder
public final class JoinClassResponseDto {
	@JsonProperty(value = "class_id")
	Long classId;
}