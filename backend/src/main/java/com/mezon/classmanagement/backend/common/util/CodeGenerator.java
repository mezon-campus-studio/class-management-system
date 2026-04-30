package com.mezon.classmanagement.backend.common.util;

public final class CodeGenerator {

	public static String generate(int length) {
		StringBuilder stringBuilder = new StringBuilder();

		for (int i = 1; i <= length; i++) {
			int number = (int) (Math.random() * 10);
			stringBuilder.append(number);
		}

		return stringBuilder.toString();
	}

}