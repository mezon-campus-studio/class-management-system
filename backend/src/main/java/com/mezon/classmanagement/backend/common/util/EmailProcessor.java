package com.mezon.classmanagement.backend.common.util;

public final class EmailProcessor {

	public static String extractAndClean(String email) {
		if (email == null || email.isEmpty()) {
			return "";
		}

		int atIndex = email.indexOf('@');
		String localPart;

		if (atIndex != -1) {
			localPart = email.substring(0, atIndex);
		} else {
			localPart = email;
		}

		return localPart.replaceAll("[^a-zA-Z0-9]", "");
	}

}