package com.mezon.classmanagement.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mezon.classmanagement.backend.dto.response.CreateClassRequestDto;
import com.mezon.classmanagement.backend.dto.response.UpdateClassRequestDto;
import com.mezon.classmanagement.backend.dto.response.child.ClassMemberResponseDto;
import com.mezon.classmanagement.backend.repository.ClassRepository;
import com.mezon.classmanagement.backend.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class ClassService {

    ClassRepository classRepository;
    UserRepository userRepository;

    @Transactional
    public void createClass(CreateClassRequestDto request) {
        var owner = userRepository.findByUsername(request.getOwnerUsername());
//                .orElseThrow(() -> new NotFoundException("User not found"));

        com.mezon.classmanagement.backend.entity.Class classEntity =
                new com.mezon.classmanagement.backend.entity.Class();

        classEntity.setOwner(owner.get());
        classEntity.setName(request.getName());
        classEntity.setDescription(request.getDescription());
        classEntity.setCode(request.getCode());
        classEntity.setAvatarUrl(request.getAvatarUrl());
        classEntity.setPrivacy(
                request.getPrivacy() == null
                        ? com.mezon.classmanagement.backend.entity.Class.Privacy.PRIVATE
                        : request.getPrivacy()
        );

        classRepository.save(classEntity);
    }

    @Transactional
    public void updateClass(Long classId, UpdateClassRequestDto request) {
        com.mezon.classmanagement.backend.entity.Class classEntity = findClassById(classId);

        if (request.getName() != null) {
            classEntity.setName(request.getName());
        }
        if (request.getDescription() != null) {
            classEntity.setDescription(request.getDescription());
        }
        if (request.getCode() != null) {
            classEntity.setCode(request.getCode());
        }
        if (request.getAvatarUrl() != null) {
            classEntity.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getPrivacy() != null) {
            classEntity.setPrivacy(request.getPrivacy());
        }

        classRepository.save(classEntity);
    }

    @Transactional
    public void deleteClass(Long classId) {
        com.mezon.classmanagement.backend.entity.Class classEntity = findClassById(classId);
        classRepository.delete(classEntity);
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