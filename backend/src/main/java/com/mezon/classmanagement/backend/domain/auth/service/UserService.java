package com.mezon.classmanagement.backend.domain.auth.service;

import com.mezon.classmanagement.backend.domain.auth.dto.signup.SignUpRequestDto;
import com.mezon.classmanagement.backend.domain.auth.entity.User;
import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.domain.auth.mapper.UserMapper;
import com.mezon.classmanagement.backend.domain.auth.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class UserService {

	/**
	 * Repository
	 */

	UserRepository userRepository;

	/**
	 * Mapper
	 */

	UserMapper userMapper;

	/**
	 * Bean
	 */

	PasswordEncoder passwordEncoder;

	@Transactional
	public User createUser(SignUpRequestDto request) {
		User user = userMapper.toUser(request);
		user.setHashedPassword(passwordEncoder.encode(request.getPassword()));

		return save(user);
	}

	@Transactional
	public User save(User user) {
		return userRepository.save(user);
	}

	@Transactional
	public void delete(User user) {
		userRepository.delete(user);
	}

	@Transactional
	public User findByUsernameOrThrow(String username) {
		return userRepository
				.findByUsername(username)
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.NOT_FOUND, "User not found")
				);
	}

	public boolean existsById(Long id) {
		return userRepository.existsById(id);
	}

	@Transactional
	public boolean existsByUsername(String username) {
		return userRepository.existsByUsername(username);
	}

	@Transactional
	public void throwIfExistsByUsername(String username) {
		if (existsByUsername(username)) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "User exists");
		}
	}

	@Transactional
	public void throwIfNotExistsByUsername(String username) {
		if (!existsByUsername(username)) {
			throw new GlobalException(GlobalException.Type.NOT_FOUND, "User not found");
		}
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