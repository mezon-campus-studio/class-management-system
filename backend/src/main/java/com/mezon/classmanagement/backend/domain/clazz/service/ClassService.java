package com.mezon.classmanagement.backend.domain.clazz.service;

import com.mezon.classmanagement.backend.common.constant.WarningConstant;
import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.common.security.annotation.RequireClassPermission;
import com.mezon.classmanagement.backend.domain.auth.entity.User;
import com.mezon.classmanagement.backend.domain.auth.service.UserService;
import com.mezon.classmanagement.backend.domain.classuser.classuser_request.service.ClassUserRequestService;
import com.mezon.classmanagement.backend.domain.classuser.dto.ClassUserResponseDto;
import com.mezon.classmanagement.backend.domain.classuser.dto.CreateClassUserRequestDto;
import com.mezon.classmanagement.backend.domain.classuser.dto.response.CreateClassUserResponseDto;
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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

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
    ClassUserRequestService classUserRequestService;

    ApplicationEventPublisher applicationEventPublisher;

    public record ClassCreatedEvent(Long classId, Long userId) {}

    @FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
    @RequiredArgsConstructor
    @Component
    public class ClassEventListener {

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void handleClassCreated(ClassCreatedEvent event) {
            createClassUser(
                    event.classId(),
                    CreateClassUserRequestDto.builder()
                            .userId(event.userId())
                            .build(),
                    ClassUser.Role.CLASS_ADMIN
            );
        }
    }

    @Transactional
    public ClassResponseDto createClass(Long clientUserId, CreateAndUpdateClassRequestDto request) {
        userService.throwIfNotExistsById(clientUserId);

        User owner = User.builder()
                .id(clientUserId)
                .build();

        Class newClass = classMapper.toClass(request);
        newClass.setOwner(owner);

        Class responseClass = save(newClass);

        applicationEventPublisher.publishEvent(
                new ClassCreatedEvent(
                        responseClass.getId(),
                        responseClass.getOwner().getId()
                )
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

    @RequireClassPermission
    @Transactional
    public ClassUserResponseDto createClassUser(
            Long classId,
            CreateClassUserRequestDto request,
            ClassUser.Role role
    ) {
        Class currentClass = findByIdOrThrow(classId);

        return classUserService.createClassUser(classId, request, role);
    }

    @Transactional
    public CreateClassUserResponseDto joinClass(Long clientUserId, JoinClassRequestDto request) {
        Class currentClass = findByCodeOrThrow(request.getClassCode());

        classUserService.throwIfExistsByClassIdAndUserId(currentClass.getId(), clientUserId);

        if (isPrivate(currentClass.getPrivacy())) {
            classUserRequestService.createClassUserRequest(
                    currentClass.getId(),
                    CreateClassUserRequestDto.builder()
                            .userId(clientUserId)
                            .build()
            );

            return CreateClassUserResponseDto.builder()
                    .type(CreateClassUserResponseDto.Type.REQUESTED)
                    .build();
        }
        if (isPublic(currentClass.getPrivacy())) {
            ClassUserResponseDto response = createClassUser(
                    currentClass.getId(),
                    CreateClassUserRequestDto.builder()
                            .userId(clientUserId)
                            .build(),
                    ClassUser.Role.CLASS_MEMBER
            );

            return CreateClassUserResponseDto.builder()
                    .type(CreateClassUserResponseDto.Type.JOINED)
                    .classId(response.getClassId())
                    .build();
        }

        throw new GlobalException(GlobalException.Type.INTERNAL_SERVER_ERROR, "Internal server error");
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