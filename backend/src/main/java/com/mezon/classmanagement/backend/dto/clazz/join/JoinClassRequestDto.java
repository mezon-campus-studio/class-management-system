package com.mezon.classmanagement.backend.dto.clazz.join;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@JsonPropertyOrder(value = {"class_code"})
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Builder
public final class JoinClassRequestDto {
	@JsonProperty(value = "class_code")
	String classCode;
}