package com.mezon.classmanagement.backend.domain.classuser.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mezon.classmanagement.backend.common.annotation.DTO;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@JsonPropertyOrder(value = {
		"type"
})
@JsonInclude(value = JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public final class CreateClassUserResponseDto {

	@JsonProperty(value = "type")
	Type type;

	@JsonProperty(value = "class_id")
	Long classId;

	@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
	@Getter
	@AllArgsConstructor
	public enum Type {
		REQUESTED("Đã gửi yêu cầu tham gia lớp"),
		JOINED("Đã tham gia lớp");

		String message;
	}

}