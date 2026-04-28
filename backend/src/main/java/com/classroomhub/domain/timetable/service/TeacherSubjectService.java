package com.classroomhub.domain.timetable.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.timetable.dto.AssignTeacherSubjectRequest;
import com.classroomhub.domain.timetable.dto.TeacherSubjectResponse;
import com.classroomhub.domain.timetable.entity.Subject;
import com.classroomhub.domain.timetable.entity.TeacherSubject;
import com.classroomhub.domain.timetable.repository.SubjectRepository;
import com.classroomhub.domain.timetable.repository.TeacherSubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TeacherSubjectService {

    private final TeacherSubjectRepository repo;
    private final SubjectRepository subjectRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public List<TeacherSubjectResponse> listAll() {
        List<TeacherSubject> assignments = repo.findAll();
        return buildResponses(assignments);
    }

    @Transactional(readOnly = true)
    public List<TeacherSubjectResponse> listByTeacher(UUID teacherId) {
        List<TeacherSubject> assignments = repo.findByTeacherId(teacherId);
        return buildResponses(assignments);
    }

    public TeacherSubjectResponse assign(AssignTeacherSubjectRequest req) {
        if (repo.existsByTeacherIdAndSubjectId(req.teacherId(), req.subjectId())) {
            throw new BusinessException(ErrorCode.TEACHER_SUBJECT_EXISTS);
        }
        Subject subject = subjectRepo.findById(req.subjectId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBJECT_NOT_FOUND));
        User teacher = userRepo.findById(req.teacherId())
                .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN));

        TeacherSubject ts = TeacherSubject.builder()
                .teacherId(req.teacherId())
                .subjectId(req.subjectId())
                .build();
        TeacherSubject saved = repo.save(ts);

        return new TeacherSubjectResponse(
                saved.getId(),
                teacher.getId(),
                teacher.getDisplayName(),
                teacher.getEmail(),
                subject.getId(),
                subject.getName(),
                subject.getCode()
        );
    }

    public void unassign(UUID id) {
        if (!repo.existsById(id)) {
            throw new BusinessException(ErrorCode.TEACHER_SUBJECT_NOT_FOUND);
        }
        repo.deleteById(id);
    }

    private List<TeacherSubjectResponse> buildResponses(List<TeacherSubject> assignments) {
        Set<UUID> teacherIds = assignments.stream().map(TeacherSubject::getTeacherId).collect(Collectors.toSet());
        Set<UUID> subjectIds = assignments.stream().map(TeacherSubject::getSubjectId).collect(Collectors.toSet());

        Map<UUID, User> userMap = userRepo.findAllById(teacherIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<UUID, Subject> subjectMap = subjectRepo.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getId, Function.identity()));

        return assignments.stream().map(ts -> {
            User teacher = userMap.get(ts.getTeacherId());
            Subject subject = subjectMap.get(ts.getSubjectId());
            return new TeacherSubjectResponse(
                    ts.getId(),
                    ts.getTeacherId(),
                    teacher != null ? teacher.getDisplayName() : null,
                    teacher != null ? teacher.getEmail() : null,
                    ts.getSubjectId(),
                    subject != null ? subject.getName() : null,
                    subject != null ? subject.getCode() : null
            );
        }).collect(Collectors.toList());
    }
}
