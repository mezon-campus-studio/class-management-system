package com.mezon.classmanagement.backend.dto.clazz.create;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mezon.classmanagement.backend.entity.Class;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

/**
 * <code>
 * <pre>
 * String name;
 * String avatarUrl;
 * </pre>
 * </code>
 */
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
public final class CreateClassRequestDto {
	@JsonProperty(value = "name")
	String name;

	@JsonProperty(value = "description")
	String description;

	@JsonProperty(value = "avatar_url")
	String avatarUrl;

	@JsonProperty(value = "privacy")
	Class.Privacy privacy;
}