package com.mezon.classmanagement.backend.domain.clazz.service;

import com.mezon.classmanagement.backend.common.constant.WarningConstant;
import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.common.security.annotation.RequireClassPermission;
import com.mezon.classmanagement.backend.domain.auth.entity.User;
import com.mezon.classmanagement.backend.domain.auth.service.UserService;
import com.mezon.classmanagement.backend.domain.classuser.dto.ClassUserResponseDto;
import com.mezon.classmanagement.backend.domain.classuser.dto.CreateClassUserRequestDto;
import com.mezon.classmanagement.backend.domain.classuser.entity.ClassUser;
import com.mezon.classmanagement.backend.domain.classuser.service.ClassUserService;
import com.mezon.classmanagement.backend.domain.clazz.dto.ClassResponseDto;
import com.mezon.classmanagement.backend.domain.clazz.dto.classid.ClassIdResponseDto;
import com.mezon.classmanagement.backend.domain.clazz.dto.createandupdate.CreateAndUpdateClassRequestDto;
import com.mezon.classmanagement.backend.domain.clazz.dto.join.JoinClassRequestDto;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import com.mezon.classmanagement.backend.domain.clazz.mapper.ClassMapper;
import com.mezon.classmanagement.backend.domain.clazz.repository.ClassRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SuppressWarnings({WarningConstant.BOOLEAN_METHOD_IS_ALWAYS_INVERTED, WarningConstant.UNUSED})
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

    UserService userService;
    ClassUserService classUserService;

    @Transactional
    public ClassResponseDto createClass(Long clientUserId, CreateAndUpdateClassRequestDto request) {
        userService.throwIfNotExistsById(clientUserId);

        User owner = User.builder()
                .id(clientUserId)
                .build();

        Class newClass = classMapper.toClass(request);
        newClass.setOwner(owner);

        Class responseClass = save(newClass);

        addAdminClassUser(
                responseClass.getId(),
                CreateClassUserRequestDto.builder()
                        .userId(clientUserId)
                        .build()
        );

        return classMapper.toClassResponseDto(responseClass);
    }

    @RequireClassPermission
    @Transactional
    public ClassResponseDto updateClass(Long classId, CreateAndUpdateClassRequestDto request) {
        Class currentClass = findByIdOrThrow(classId);

        classMapper.updateClassFromRequestDto(request, currentClass);

        Class responseClass = save(currentClass);

        return classMapper.toClassResponseDto(responseClass);
    }

    @RequireClassPermission
    @Transactional
    public ClassIdResponseDto deleteClass(Long classId) {
        Class currentClass = findByIdOrThrow(classId);

        delete(currentClass);

        return ClassIdResponseDto.builder()
                .classId(currentClass.getId())
                .build();
    }

    @Transactional
    protected void addAdminClassUser(
            Long classId,
            CreateClassUserRequestDto request
    ) {
        throwIfNotExistsById(classId);

        classUserService.createClassUser(classId, request, ClassUser.Role.CLASS_ADMIN);
    }

    @RequireClassPermission
    @Transactional
    public ClassUserResponseDto addMemberClassUser(
            Long classId,
            CreateClassUserRequestDto request
    ) {
        Class currentClass = findByIdOrThrow(classId);

        ClassUser.Role role = null;
        if (isPublic(currentClass)) {
            role = ClassUser.Role.CLASS_MEMBER;
        }
        if (isPrivate(currentClass)) {
            role = ClassUser.Role.PENDING_CLASS_MEMBER;
        }

        return classUserService.createClassUser(classId, request, role);
    }

    @Transactional
    public ClassIdResponseDto joinClass(Long clientUserId, JoinClassRequestDto request) {
        Class currentClass = findByCodeOrThrow(request.getClassCode());

        classUserService.throwIfExistsByClassIdAndUserId(currentClass.getId(), clientUserId);

        ClassUserResponseDto response = addMemberClassUser(
                currentClass.getId(),
                CreateClassUserRequestDto.builder()
                        .userId(clientUserId)
                        .build()
        );

        return ClassIdResponseDto.builder()
                .classId(response.getClassId())
                .build();
    }

    @RequireClassPermission
    @Transactional
    public ClassIdResponseDto leaveClass(Long clientUserId, Long classId) {
        ClassUser currentClassUser = classUserService.findByClassIdAndUserIdOrThrow(classId, clientUserId);

        classUserService.delete(currentClassUser);

        return ClassIdResponseDto.builder()
                .classId(currentClassUser.getClazz().getId())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ClassResponseDto> getJoinedClasses(Long clientUserId) {
        userService.throwIfNotExistsById(clientUserId);

        return classRepository.getJoinedClasses(clientUserId);
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

    @Transactional(readOnly = true)
    public Class findByIdOrThrow(Long id) {
		return classRepository
				.findById(id)
				.orElseThrow(() ->
                        new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found")
                );
    }

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return classRepository.existsById(id);
    }

    @Transactional(readOnly = true)
    public void throwIfNotExistsById(Long id) {
        if (!existsById(id)) {
            throw new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found");
        }
    }

    /**
     * Validate
     */

    @Transactional
    public boolean isPublic(Long id) {
        Class clazz = findByIdOrThrow(id);
        return Class.Privacy.PUBLIC == clazz.getPrivacy();
    }

    public boolean isPublic(Class.Privacy privacy) {
        return Class.Privacy.PUBLIC == privacy;
    }

    public boolean isPublic(Class clazz) {
        return Class.Privacy.PUBLIC == clazz.getPrivacy();
    }

    @Transactional
    public boolean isPrivate(Long id) {
        Class clazz = findByIdOrThrow(id);
        return Class.Privacy.PRIVATE.equals(clazz.getPrivacy());
    }

    public boolean isPrivate(Class.Privacy privacy) {
        return Class.Privacy.PRIVATE.equals(privacy);
    }

    public boolean isPrivate(Class clazz) {
        return Class.Privacy.PRIVATE == clazz.getPrivacy();
    }
    
}