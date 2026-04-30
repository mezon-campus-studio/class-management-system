package com.mezon.classmanagement.backend.common.exeption.custom;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mezon.classmanagement.backend.common.dto.ResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

	@Override
	public void commence(
			@NonNull HttpServletRequest httpServletRequest,
			@NonNull HttpServletResponse httpServletResponse,
			@NonNull AuthenticationException authenticationException
	) throws IOException {
		ObjectMapper objectMapper = JsonMapper.builder()
				.addModule(new JavaTimeModule())
				.build();

		httpServletResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		httpServletResponse.setContentType("application/json");

		ResponseDTO<?> responseDTO = ResponseDTO.builder()
				.success(false)
				.code(httpServletResponse.getStatus())
				.message("Unauthorized")
				.build();

		httpServletResponse.getWriter().write(objectMapper.writeValueAsString(responseDTO));
	}

}