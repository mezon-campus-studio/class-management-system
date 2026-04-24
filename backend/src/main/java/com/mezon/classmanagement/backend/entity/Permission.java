package com.mezon.classmanagement.backend.entity;

import com.mezon.classmanagement.backend.constant.WarningConstant;
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
	MANAGE_FUND("Quản lý khoản thu"),
	MANAGE_POINT("Quản lý điểm thi đua");

	String label;
}