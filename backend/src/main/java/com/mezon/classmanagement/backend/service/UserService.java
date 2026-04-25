package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.dto.response.child.UserResponseDto;
import com.mezon.classmanagement.backend.entity.User;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.mapper.UserMapper;
import com.mezon.classmanagement.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.Optional;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class UserService {

	UserRepository userRepository;
	UserMapper userMapper;

	public UserResponseDto findByUsername(String username) {
		Optional<User> userOptional = userRepository.findByUsername(username);
		return userOptional
				.map(userMapper::toUserResponseDto)
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "User not found"));
	}

	public boolean existsById(Long id) {
		return userRepository.existsById(id);
	}

	public void throwIfExistsById(Long id) {
		if (existsById(id)) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "User exists");
		}
	}

	public void throwIfNotExistsById(Long id) {
		if (!existsById(id)) {
			throw new GlobalException(GlobalException.Type.NOT_FOUND, "User not found");
		}
	}

}