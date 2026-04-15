package com.mezon.classmanagement.backend.component;

import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public void commence(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull AuthenticationException exception
	) throws IOException {

		ResponseDTO<?> responseDTO = ResponseDTO.builder()
				.success(false)
				.message("Unauthorized")
				.build();

		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType("application/json");

		response.getWriter().write(objectMapper.writeValueAsString(responseDTO));
	}

}