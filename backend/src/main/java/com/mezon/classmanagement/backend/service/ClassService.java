package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.annotation.RequireClassPermission;
import com.mezon.classmanagement.backend.constant.WarningConstant;
import com.mezon.classmanagement.backend.dto.clazz.ClassDto;
import com.mezon.classmanagement.backend.dto.clazz.create.CreateClassRequestDto;
import com.mezon.classmanagement.backend.dto.clazz.join.JoinClassResponseDto;
import com.mezon.classmanagement.backend.dto.clazz.leave.LeaveClassResponseDto;
import com.mezon.classmanagement.backend.dto.clazz.update.UpdateClassRequestDto;
import com.mezon.classmanagement.backend.dto.clazz.join.JoinClassRequestDto;
import com.mezon.classmanagement.backend.dto.response.child.ClassMemberResponseDto;
import com.mezon.classmanagement.backend.entity.Class;
import com.mezon.classmanagement.backend.entity.ClassUser;
import com.mezon.classmanagement.backend.entity.User;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.mapper.ClassMapper;
import com.mezon.classmanagement.backend.repository.ClassRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SuppressWarnings({WarningConstant.BOOLEAN_METHOD_IS_ALWAYS_INVERTED})
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class ClassService {

    /**
     * Repository
     */

    ClassRepository classRepository;

    /**
     * Mapper
     */

    ClassMapper classMapper;

    /**
     * Other services
     */

    ClassUserService classUserService;
    UserService userService;

    /**
     * For controller
     */

    @Transactional
    public ClassDto createClass(Long clientUserId, CreateClassRequestDto request) {
        userService.throwIfNotExistsById(clientUserId);

        User owner = User.builder()
                .id(clientUserId)
                .build();
        Class newClass = classMapper.toClass(request);
        newClass.setOwner(owner);

        Class responseClass = save(newClass);

        return classMapper.toCreateClassResponseDto(responseClass);
    }

    @RequireClassPermission
    @Transactional
    public ClassDto updateClass(Long classId, UpdateClassRequestDto request) {
        Class currentClass = findByIdOrThrow(classId);

        classMapper.updateClassFromRequestDto(request, currentClass);

        Class responseClass = save(currentClass);

        return classMapper.toUpdateClassResponseDto(responseClass);
    }

    @RequireClassPermission
    @Transactional
    public void deleteClass(Long classId) {
        Class currentClass = findByIdOrThrow(classId);

        delete(currentClass);
    }

    @Transactional
    public JoinClassResponseDto joinClass(Long clientUserId, JoinClassRequestDto request) {
        Class currentClass = findByCodeOrThrow(request.getClassCode());

        userService.throwIfNotExistsById(clientUserId);

        classUserService.throwIfExistsByClassIdAndUserId(currentClass.getId(), clientUserId);

        Class clazz = Class.builder()
                .id(currentClass.getId())
                .build();
        User user = User.builder()
                .id(clientUserId)
                .build();

        ClassUser.Role role = null;
        if (isPublic(currentClass)) {
            role = ClassUser.Role.CLASS_MEMBER;
        }
        if (isPrivate(currentClass)) {
            role = ClassUser.Role.PENDING_CLASS_MEMBER;
        }

        ClassUser classUser = ClassUser.builder()
                .clazz(clazz)
                .user(user)
                .role(role)
                .build();

        classUserService.save(classUser);

        return JoinClassResponseDto.builder()
                .classId(currentClass.getId())
                .build();
    }

    @Transactional
    public LeaveClassResponseDto leaveClass(Long clientUserId, Long classId) {
        throwIfNotExistsById(classId);

        userService.throwIfNotExistsById(clientUserId);

        ClassUser currentClassUser = classUserService.findByClassIdAndUserIdOrThrow(classId, clientUserId);

        classUserService.throwIfIsAdmin(currentClassUser);

        classUserService.delete(currentClassUser);

        return LeaveClassResponseDto.builder()
                .classId(classId)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ClassDto> getJoinedClasses(Long clientUserId) {
        userService.throwIfNotExistsById(clientUserId);

        return classRepository.getJoinedClasses(clientUserId);
    }

    @Transactional(readOnly = true)
    public List<ClassMemberResponseDto> getClassMembers(Long classId) {
        if (!existsById(classId)) {
            throw new RuntimeException("Class not found");
        }
        return classRepository.getClassMembers(classId);
    }

    /**
     * Action
     */

    @Transactional
    public Class save(Class clazz) {
        return classRepository.save(clazz);
    }

    @Transactional
    public void delete(Class clazz) {
        classRepository.delete(clazz);
    }

    /**
     * Find
     */

    @Transactional
    public Class findByIdOrThrow(Long id) {
		return classRepository
				.findById(id)
				.orElseThrow(() ->
                        new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found")
                );
    }

    @Transactional
    public Class findByCodeOrThrow(String code) {
        return classRepository
                .findByCode(code)
                .orElseThrow(() ->
                        new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found")
                );
    }

    /**
     * Exists
     */

    @Transactional
    public boolean existsById(Long id) {
        return classRepository.existsById(id);
    }

    @Transactional
    public void throwIfExistsById(Long id) {
        if (existsById(id)) {
            throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "Class exists");
        }
    }

    @Transactional
    public void throwIfNotExistsById(Long id) {
        if (!existsById(id)) {
            throw new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found");
        }
    }

    /**
     * Privacy
     */

    public boolean isPublic(Class clazz) {
        return Class.Privacy.PUBLIC.equals(clazz.getPrivacy());
    }

    public boolean isPrivate(Class clazz) {
        return Class.Privacy.PRIVATE.equals(clazz.getPrivacy());
    }
    
}