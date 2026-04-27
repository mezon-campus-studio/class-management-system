package com.mezon.classmanagement.backend.oauth.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mezon.classmanagement.backend.constant.WarningConstant;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@SuppressWarnings({WarningConstant.SPELL_CHECKING_INSPECTION})
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MezonUser {
	@JsonProperty("user_id")
	String userId;

	@JsonProperty("mezon_id")
	String mezonId;

	@JsonProperty("sub")
	String sub;

	@JsonProperty("email")
	String email;

	@JsonProperty("username")
	String username;

	@JsonProperty("display_name")
	String displayName;

	@JsonProperty("avatar")
	String avatar;
}
