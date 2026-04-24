package com.mezon.classmanagement.backend.component.exceptionhandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mezon.classmanagement.backend.dto.ResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

	@Override
	public void handle(
			@NonNull HttpServletRequest httpServletRequest,
			@NonNull HttpServletResponse httpServletResponse,
			@NonNull AccessDeniedException accessDeniedException
	) throws IOException {
		ObjectMapper objectMapper = JsonMapper.builder()
				.addModule(new JavaTimeModule())
				.build();

		httpServletResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
		httpServletResponse.setContentType("application/json");

		ResponseDTO<?> responseDTO = ResponseDTO.builder()
				.success(false)
				.code(httpServletResponse.getStatus())
				.message("Forbidden")
				.build();

		httpServletResponse.getWriter().write(objectMapper.writeValueAsString(responseDTO));
	}

}