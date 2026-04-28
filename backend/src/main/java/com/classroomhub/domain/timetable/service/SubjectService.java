package com.classroomhub.domain.timetable.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.timetable.dto.CreateSubjectRequest;
import com.classroomhub.domain.timetable.dto.SubjectResponse;
import com.classroomhub.domain.timetable.dto.UpdateSubjectRequest;
import com.classroomhub.domain.timetable.entity.Subject;
import com.classroomhub.domain.timetable.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SubjectService {

    private final SubjectRepository subjectRepo;

    @Transactional(readOnly = true)
    public List<SubjectResponse> listAll() {
        return subjectRepo.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SubjectResponse create(CreateSubjectRequest req) {
        if (subjectRepo.existsByCode(req.code())) {
            throw new BusinessException(ErrorCode.SUBJECT_CODE_EXISTS);
        }
        Subject subject = Subject.builder()
                .name(req.name())
                .code(req.code())
                .periodsPerWeek(req.periodsPerWeek())
                .colorHex(req.colorHex() != null ? req.colorHex() : "#C2714F")
                .build();
        return toResponse(subjectRepo.save(subject));
    }

    public SubjectResponse update(UUID id, UpdateSubjectRequest req) {
        Subject subject = subjectRepo.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBJECT_NOT_FOUND));

        if (req.name() != null) {
            subject.setName(req.name());
        }
        if (req.code() != null && !req.code().equals(subject.getCode())) {
            if (subjectRepo.existsByCode(req.code())) {
                throw new BusinessException(ErrorCode.SUBJECT_CODE_EXISTS);
            }
            subject.setCode(req.code());
        }
        if (req.periodsPerWeek() != null) {
            subject.setPeriodsPerWeek(req.periodsPerWeek());
        }
        if (req.colorHex() != null) {
            subject.setColorHex(req.colorHex());
        }
        return toResponse(subjectRepo.save(subject));
    }

    public void delete(UUID id) {
        if (!subjectRepo.existsById(id)) {
            throw new BusinessException(ErrorCode.SUBJECT_NOT_FOUND);
        }
        subjectRepo.deleteById(id);
    }

    private SubjectResponse toResponse(Subject s) {
        return new SubjectResponse(
                s.getId(),
                s.getName(),
                s.getCode(),
                s.getPeriodsPerWeek(),
                s.getColorHex(),
                s.getCreatedAt()
        );
    }
}
