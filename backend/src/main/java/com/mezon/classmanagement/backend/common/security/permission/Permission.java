package com.mezon.classmanagement.backend.common.security.permission;

import com.mezon.classmanagement.backend.common.constant.WarningConstant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@SuppressWarnings(value = {WarningConstant.SPELL_CHECKING_INSPECTION})
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Getter
@RequiredArgsConstructor
public enum Permission {
	MANAGE_ACTIVITY("Quản lý hoạt động"),
	MANAGE_GROUP("Quản lý tổ"),
	MANAGE_FUND("Quản lý thu chi"),
	MANAGE_POINT("Quản lý điểm thi đua");

	String label;
}