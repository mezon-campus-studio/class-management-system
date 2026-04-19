package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.entity.Permission;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class PermissionService {

	public List<Permission> getPermissions() {
		return Arrays.asList(Permission.class.getEnumConstants());
	}

	/* noinspection
	private <E extends Enum<E>> List<E> toList(Class<E> enumClass) {
		return Arrays.asList(enumClass.getEnumConstants());
	}
	*/

}