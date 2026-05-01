package com.mezon.classmanagement.backend.domain.absencerequest.service;

import com.mezon.classmanagement.backend.domain.absencerequest.repository.AbsenceRequestRepository;
import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.domain.absencerequest.dto.request.CreateAbsenceRequestRequestDto;
import com.mezon.classmanagement.backend.domain.absencerequest.dto.response.AbsenceRequestResponseDto;
import com.mezon.classmanagement.backend.domain.absencerequest.entity.AbsenceRequest;
import com.mezon.classmanagement.backend.domain.absencerequest.mapper.AbsenceRequestMapper;
import com.mezon.classmanagement.backend.domain.auth.entity.User;
import com.mezon.classmanagement.backend.domain.auth.service.UserService;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import com.mezon.classmanagement.backend.domain.clazz.service.ClassService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class AbsenceRequestService {

    AbsenceRequestRepository repository;
    AbsenceRequestMapper mapper;
    UserService userService;
    ClassService classService;

    @Transactional
    public AbsenceRequestResponseDto create(Long userId, CreateAbsenceRequestRequestDto request) {
        userService.throwIfNotExistsById(userId);
        classService.throwIfNotExistsById(request.getClassId());

        AbsenceRequest entity = mapper.toEntity(request);
        entity.setUser(User.builder().id(userId).build());
        entity.setClazz(Class.builder().id(request.getClassId()).build());

        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public AbsenceRequestResponseDto get(Long id) {
        return mapper.toResponse(findByIdOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<AbsenceRequestResponseDto> listByUser(Long userId) {
        userService.throwIfNotExistsById(userId);
        return repository.findByUser_Id(userId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AbsenceRequestResponseDto> listByClass(Long classId) {
        classService.throwIfNotExistsById(classId);
        return repository.findByClazz_Id(classId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public AbsenceRequestResponseDto approve(Long id) {
        AbsenceRequest entity = findByIdOrThrow(id);
        throwIfNotPending(entity);
        entity.setStatus(AbsenceRequest.Status.APPROVED);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public AbsenceRequestResponseDto reject(Long id) {
        AbsenceRequest entity = findByIdOrThrow(id);
        throwIfNotPending(entity);
        entity.setStatus(AbsenceRequest.Status.REJECTED);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(findByIdOrThrow(id));
    }

    private AbsenceRequest findByIdOrThrow(Long id) {
        return repository.findById(id).orElseThrow(
                () -> new GlobalException(GlobalException.Type.NOT_FOUND, "Absence request not found")
        );
    }

    private void throwIfNotPending(AbsenceRequest entity) {
        if (entity.getStatus() != AbsenceRequest.Status.PENDING) {
            throw new GlobalException(GlobalException.Type.FORBIDDEN, "Absence request is already processed");
        }

    }
}
