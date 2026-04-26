package com.mezon.classmanagement.backend.dto.clazz.createandupdate;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mezon.classmanagement.backend.entity.Class;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@JsonPropertyOrder({"id", "name", "description", "avatar_url", "privacy"})
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
public final class CreateAndUpdateClassRequestDto {
	@JsonProperty(value = "name")
	String name;

	@JsonProperty(value = "description")
	String description;

	@JsonProperty(value = "avatar_url")
	String avatarUrl;

	@JsonProperty(value = "privacy")
	Class.Privacy privacy;
}