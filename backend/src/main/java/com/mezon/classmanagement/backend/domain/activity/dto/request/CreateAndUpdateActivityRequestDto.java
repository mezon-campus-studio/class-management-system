package com.mezon.classmanagement.backend.domain.activity.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mezon.classmanagement.backend.common.annotation.DTO;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public final class CreateAndUpdateActivityRequestDto {

	@JsonProperty(value = "name")
	String name;

	@JsonProperty(value = "description")
	String description;

	@JsonProperty(value = "start_at")
	Instant startAt;

	@JsonProperty(value = "end_at")
	Instant endAt;

	@JsonProperty(value = "registration_end_at")
	Instant registrationEndAt;

	@JsonProperty(value = "location")
	String location;

	@JsonProperty(value = "point")
	Short point;

	@JsonProperty(value = "is_mandatory")
	Boolean isMandatory;

}