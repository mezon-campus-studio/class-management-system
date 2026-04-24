package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.dto.clazz.ClassDto;
import com.mezon.classmanagement.backend.dto.clazz.create.CreateClassRequestDto;
import com.mezon.classmanagement.backend.dto.clazz.update.UpdateClassRequestDto;
import com.mezon.classmanagement.backend.dto.joinclass.JoinClassDto;
import com.mezon.classmanagement.backend.dto.joinedclass.JoinedClassResponseDto;
import com.mezon.classmanagement.backend.dto.response.child.ClassMemberResponseDto;
import com.mezon.classmanagement.backend.entity.Class;
import com.mezon.classmanagement.backend.entity.ClassUser;
import com.mezon.classmanagement.backend.entity.User;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.mapper.ClassMapper;
import com.mezon.classmanagement.backend.repository.ClassRepository;
import com.mezon.classmanagement.backend.repository.ClassUserRepository;
import com.mezon.classmanagement.backend.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class ClassService {

    ClassRepository classRepository;
    ClassMapper classMapper;
    UserRepository userRepository;
    ClassUserRepository classUserRepository;
    AuthService authService;
    JwtService jwtService;
    ClassUserService classUserService;

    @Transactional
    public ClassDto createClass(Long ownerUserId, CreateClassRequestDto request) {
        if (!userRepository.existsById(ownerUserId)) {
            throw new GlobalException(GlobalException.Type.NOT_FOUND, "User not found");
        }

        Class insertedClass = classMapper.toClass(request);
        insertedClass.setOwner(
                User.builder()
                        .id(ownerUserId)
                        .build()
        );

        Class responseClass = classRepository.save(insertedClass);

        return classMapper.toCreateClassResponseDto(responseClass);
    }

    @Transactional
    public ClassDto updateClass(Long currentUserId, UpdateClassRequestDto request) {
        Class currentClass = classRepository
                .findById(request.getId())
                .orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found"));

        if (!userRepository.existsById(currentUserId)) {
            throw new GlobalException(GlobalException.Type.NOT_FOUND, "User not found");
        }
        if (!classUserService.isClassUser(request.getId(), currentUserId)) {
            throw new GlobalException(GlobalException.Type.NOT_FOUND, "Class user not found");
        }

        classMapper.updateClassFromRequestDto(request, currentClass);

        Class responseClass = classRepository.save(currentClass);

        return classMapper.toUpdateClassResponseDto(responseClass);
    }

    @Transactional
    public void deleteClass(Long classId) {
        Class clazz = classRepository
                .findById(classId)
                .orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found"));

        classRepository.delete(clazz);
    }

    @Transactional
    public JoinClassDto joinClass(Long classId, Long userId) {
        if (!classRepository.existsById(classId)) {
            throw new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found");
        }
        if (!userRepository.existsById(userId)) {
            throw new GlobalException(GlobalException.Type.NOT_FOUND, "User not found");
        }
        if (classUserRepository.existsByClazz_IdAndUser_Id(classId, userId)) {
            throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "Class user exists");
        }

        ClassUser classUser = ClassUser.builder()
                .clazz(
                        Class.builder()
                                .id(classId)
                                .build()
                )
                .user(
                        User.builder()
                                .id(userId)
                                .build()
                )
                .build();

        classUserRepository.save(classUser);

        return JoinClassDto.builder()
                .classId(classId)
                .build();
    }

    @Transactional(readOnly = true)
    public List<JoinedClassResponseDto> getJoinedClasses(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new GlobalException(GlobalException.Type.NOT_FOUND, "User not found");
        }
        return classRepository.getJoinedClasses(userId);
    }

    @Transactional(readOnly = true)
    public List<ClassMemberResponseDto> getClassMembers(Long classId) {
        if (!classRepository.existsById(classId)) {
            throw new RuntimeException("Class not found");
        }
        return classRepository.getClassMembers(classId);
    }

    private com.mezon.classmanagement.backend.entity.Class findClassById(Long classId) {
        return classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
    }
    
}