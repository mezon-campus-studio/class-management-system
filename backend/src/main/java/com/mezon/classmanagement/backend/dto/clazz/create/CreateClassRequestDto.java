package com.mezon.classmanagement.backend.dto.clazz.create;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
public final class CreateClassRequestDto {
	@JsonProperty(value = "name")
	String name;

	@JsonProperty(value = "avatar_url")
	String avatarUrl;
}