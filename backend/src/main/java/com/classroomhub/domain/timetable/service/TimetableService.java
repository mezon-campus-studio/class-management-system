package com.classroomhub.domain.timetable.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.classroom.entity.Classroom;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.repository.ClassroomMemberRepository;
import com.classroomhub.domain.classroom.repository.ClassroomRepository;
import com.classroomhub.domain.attendance.service.AttendanceService;
import com.classroomhub.domain.timetable.dto.*;
import com.classroomhub.domain.timetable.entity.ClassroomSubjectConfig;
import com.classroomhub.domain.timetable.entity.Subject;
import com.classroomhub.domain.timetable.entity.TimetableEntry;
import com.classroomhub.domain.timetable.repository.ClassroomSubjectConfigRepository;
import com.classroomhub.domain.timetable.repository.SubjectRepository;
import com.classroomhub.domain.timetable.repository.TimetableEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional
public class TimetableService {

    private final TimetableEntryRepository entryRepo;
    private final SubjectRepository subjectRepo;
    private final UserRepository userRepo;
    private final ClassroomRepository classroomRepo;
    private final ClassroomMemberRepository classroomMemberRepo;
    private final ClassroomSubjectConfigRepository configRepo;

    @Autowired @Lazy
    private AttendanceService attendanceService;

    // ─── Slot key helper ────────────────────────────────────────────────────────

    private record SlotKey(TimetableEntry.DayOfWeek day, int period) {}

    // ─── Read ────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TimetableEntryResponse> getByClassroom(UUID classroomId, String academicYear, int semester) {
        if (!classroomRepo.existsById(classroomId)) {
            throw new BusinessException(ErrorCode.CLASSROOM_NOT_FOUND);
        }
        List<TimetableEntry> entries = entryRepo.findByClassroomIdAndAcademicYearAndSemester(classroomId, academicYear, semester);
        return toResponses(entries);
    }

    @Transactional(readOnly = true)
    public List<TimetableEntryResponse> getMySchedule(UUID userId, String academicYear, int semester) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN));

        if (user.getUserType() == User.UserType.TEACHER) {
            List<TimetableEntry> entries = entryRepo.findByTeacherIdAndAcademicYearAndSemester(userId, academicYear, semester);
            return toResponses(entries);
        } else {
            // STUDENT or any other role: find classrooms they are in
            List<UUID> classroomIds = classroomMemberRepo.findAllByUserId(userId).stream()
                    .map(ClassroomMember::getClassroomId)
                    .collect(Collectors.toList());
            if (classroomIds.isEmpty()) {
                return Collections.emptyList();
            }
            List<TimetableEntry> entries = entryRepo.findByClassroomIdInAndAcademicYearAndSemester(classroomIds, academicYear, semester);
            return toResponses(entries);
        }
    }

    // ─── CRUD ────────────────────────────────────────────────────────────────────

    public TimetableEntryResponse create(CreateTimetableEntryRequest req, UUID requesterId) {
        if (!classroomRepo.existsById(req.classroomId())) {
            throw new BusinessException(ErrorCode.CLASSROOM_NOT_FOUND);
        }
        if (!subjectRepo.existsById(req.subjectId())) {
            throw new BusinessException(ErrorCode.SUBJECT_NOT_FOUND);
        }
        TimetableEntry.DayOfWeek dow = parseDayOfWeek(req.dayOfWeek());

        if (entryRepo.existsByClassroomIdAndDayOfWeekAndPeriodAndAcademicYearAndSemester(
                req.classroomId(), dow, req.period(), req.academicYear(), req.semester())) {
            throw new BusinessException(ErrorCode.TIMETABLE_CLASSROOM_CONFLICT);
        }
        if (req.teacherId() != null && entryRepo.existsByTeacherIdAndDayOfWeekAndPeriodAndAcademicYearAndSemester(
                req.teacherId(), dow, req.period(), req.academicYear(), req.semester())) {
            throw new BusinessException(ErrorCode.TIMETABLE_TEACHER_CONFLICT);
        }

        TimetableEntry entry = TimetableEntry.builder()
                .classroomId(req.classroomId())
                .subjectId(req.subjectId())
                .teacherId(req.teacherId())
                .dayOfWeek(dow)
                .period(req.period())
                .academicYear(req.academicYear())
                .semester(req.semester())
                .build();
        TimetableEntry saved = entryRepo.save(entry);
        attendanceService.preGenerateSessionsFromEntries(List.of(saved), requesterId, 14);
        return toResponse(saved);
    }

    public TimetableEntryResponse update(UUID id, UpdateTimetableEntryRequest req) {
        TimetableEntry entry = entryRepo.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TIMETABLE_ENTRY_NOT_FOUND));

        TimetableEntry.DayOfWeek dow = req.dayOfWeek() != null ? parseDayOfWeek(req.dayOfWeek()) : entry.getDayOfWeek();
        int period = req.period() != null ? req.period() : entry.getPeriod();

        // Check classroom slot conflict only if day/period is changing
        boolean slotChanged = (req.dayOfWeek() != null || req.period() != null);
        if (slotChanged) {
            if (entryRepo.existsByClassroomIdAndDayOfWeekAndPeriodAndAcademicYearAndSemester(
                    entry.getClassroomId(), dow, period, entry.getAcademicYear(), entry.getSemester())) {
                // Only conflict if it's a different entry
                TimetableEntry existing = entryRepo
                        .findByClassroomIdAndAcademicYearAndSemester(entry.getClassroomId(), entry.getAcademicYear(), entry.getSemester())
                        .stream()
                        .filter(e -> e.getDayOfWeek() == dow && e.getPeriod() == period && !e.getId().equals(id))
                        .findFirst().orElse(null);
                if (existing != null) {
                    throw new BusinessException(ErrorCode.TIMETABLE_CLASSROOM_CONFLICT);
                }
            }
        }

        UUID teacherId = req.teacherId() != null ? req.teacherId() : entry.getTeacherId();
        if (teacherId != null && (slotChanged || !teacherId.equals(entry.getTeacherId()))) {
            if (entryRepo.existsByTeacherIdAndDayOfWeekAndPeriodAndAcademicYearAndSemester(
                    teacherId, dow, period, entry.getAcademicYear(), entry.getSemester())) {
                TimetableEntry existing = entryRepo
                        .findByTeacherIdAndAcademicYearAndSemester(teacherId, entry.getAcademicYear(), entry.getSemester())
                        .stream()
                        .filter(e -> e.getDayOfWeek() == dow && e.getPeriod() == period && !e.getId().equals(id))
                        .findFirst().orElse(null);
                if (existing != null) {
                    throw new BusinessException(ErrorCode.TIMETABLE_TEACHER_CONFLICT);
                }
            }
        }

        if (req.subjectId() != null) {
            if (!subjectRepo.existsById(req.subjectId())) {
                throw new BusinessException(ErrorCode.SUBJECT_NOT_FOUND);
            }
            entry.setSubjectId(req.subjectId());
        }
        entry.setTeacherId(teacherId);
        entry.setDayOfWeek(dow);
        entry.setPeriod(period);

        return toResponse(entryRepo.save(entry));
    }

    public void delete(UUID id) {
        if (!entryRepo.existsById(id)) {
            throw new BusinessException(ErrorCode.TIMETABLE_ENTRY_NOT_FOUND);
        }
        entryRepo.deleteById(id);
    }

    // ─── Auto-generate ───────────────────────────────────────────────────────────

    public GenerateTimetableResponse generate(GenerateTimetableRequest req, UUID requesterId) {
        String ay = req.academicYear();
        int sem = req.semester();

        // Collect all classroom IDs in this request
        List<UUID> classroomIds = req.classrooms().stream()
                .map(GenerateTimetableRequest.ClassroomSpec::classroomId)
                .collect(Collectors.toList());

        if (req.clearExisting()) {
            for (UUID cid : classroomIds) {
                entryRepo.deleteByClassroomIdAndAcademicYearAndSemester(cid, ay, sem);
            }
        }

        // Pre-load teacher occupancy from existing entries (for other classrooms / !clearExisting)
        // Map: teacherId -> Set of "DAY_period" keys already occupied
        Map<UUID, Set<String>> teacherOccupied = new HashMap<>();

        // Load existing entries for all other classrooms that share the same year/semester
        // We query per-classroom below so teacher occupancy is accumulated as we go

        List<TimetableEntry.DayOfWeek> days = Arrays.asList(
                TimetableEntry.DayOfWeek.MONDAY,
                TimetableEntry.DayOfWeek.TUESDAY,
                TimetableEntry.DayOfWeek.WEDNESDAY,
                TimetableEntry.DayOfWeek.THURSDAY,
                TimetableEntry.DayOfWeek.FRIDAY,
                TimetableEntry.DayOfWeek.SATURDAY
        );
        List<Integer> periods = IntStream.rangeClosed(1, 10).boxed().collect(Collectors.toList());

        // Pre-populate teacher occupied from existing DB entries that we are NOT clearing
        if (!req.clearExisting()) {
            for (GenerateTimetableRequest.ClassroomSpec cs : req.classrooms()) {
                List<TimetableEntry> existingForClassroom = entryRepo
                        .findByClassroomIdAndAcademicYearAndSemester(cs.classroomId(), ay, sem);
                for (TimetableEntry e : existingForClassroom) {
                    if (e.getTeacherId() != null) {
                        String key = e.getDayOfWeek().name() + "_" + e.getPeriod();
                        teacherOccupied.computeIfAbsent(e.getTeacherId(), k -> new HashSet<>()).add(key);
                    }
                }
            }
        }

        // Load subject and classroom names for response building
        Map<UUID, String> classroomNames = classroomRepo.findAllById(classroomIds).stream()
                .collect(Collectors.toMap(Classroom::getId, Classroom::getName));

        List<TimetableEntryResponse> created = new ArrayList<>();
        List<TimetableEntry> savedEntries = new ArrayList<>();
        List<String> conflicts = new ArrayList<>();

        for (GenerateTimetableRequest.ClassroomSpec cs : req.classrooms()) {
            // Current occupied slots for this classroom
            Set<String> classroomOccupied = entryRepo
                    .findByClassroomIdAndAcademicYearAndSemester(cs.classroomId(), ay, sem)
                    .stream()
                    .map(e -> e.getDayOfWeek().name() + "_" + e.getPeriod())
                    .collect(Collectors.toSet());

            String classroomName = classroomNames.getOrDefault(cs.classroomId(), cs.classroomId().toString());

            // Sort assignments: most periods first for fair distribution
            List<GenerateTimetableRequest.SubjectAssignment> sorted = cs.assignments().stream()
                    .sorted(Comparator.comparingInt(GenerateTimetableRequest.SubjectAssignment::periodsPerWeek).reversed())
                    .collect(Collectors.toList());

            for (GenerateTimetableRequest.SubjectAssignment sa : sorted) {
                int needed = sa.periodsPerWeek();

                // Build candidate list: (day, period) not occupied by classroom or teacher
                Map<TimetableEntry.DayOfWeek, List<Integer>> byDay = new LinkedHashMap<>();
                for (TimetableEntry.DayOfWeek day : days) {
                    List<Integer> available = new ArrayList<>();
                    for (int p : periods) {
                        String key = day.name() + "_" + p;
                        if (classroomOccupied.contains(key)) continue;
                        if (sa.teacherId() != null) {
                            Set<String> tOcc = teacherOccupied.getOrDefault(sa.teacherId(), Collections.emptySet());
                            if (tOcc.contains(key)) continue;
                        }
                        available.add(p);
                    }
                    if (!available.isEmpty()) {
                        byDay.put(day, available);
                    }
                }

                List<SlotKey> spread = interleaveByDay(byDay, needed);

                // Fetch subject name for conflict message
                String subjectName = subjectRepo.findById(sa.subjectId())
                        .map(Subject::getName)
                        .orElse(sa.subjectId().toString());

                if (spread.size() < needed) {
                    conflicts.add(String.format(
                            "Không đủ slot cho môn %s ở lớp %s (cần %d, tìm được %d)",
                            subjectName, classroomName, needed, spread.size()));
                }

                List<SlotKey> toPlace = spread.subList(0, Math.min(needed, spread.size()));
                for (SlotKey slot : toPlace) {
                    TimetableEntry entry = TimetableEntry.builder()
                            .classroomId(cs.classroomId())
                            .subjectId(sa.subjectId())
                            .teacherId(sa.teacherId())
                            .dayOfWeek(slot.day())
                            .period(slot.period())
                            .academicYear(ay)
                            .semester(sem)
                            .build();
                    TimetableEntry saved = entryRepo.save(entry);
                    savedEntries.add(saved);

                    String key = slot.day().name() + "_" + slot.period();
                    classroomOccupied.add(key);
                    if (sa.teacherId() != null) {
                        teacherOccupied.computeIfAbsent(sa.teacherId(), k -> new HashSet<>()).add(key);
                    }
                    created.add(toResponse(saved));
                }
            }
        }

        if (!savedEntries.isEmpty()) {
            attendanceService.preGenerateSessionsFromEntries(savedEntries, requesterId, 14);
        }
        return new GenerateTimetableResponse(created, conflicts);
    }

    private List<SlotKey> interleaveByDay(Map<TimetableEntry.DayOfWeek, List<Integer>> byDay, int needed) {
        List<SlotKey> result = new ArrayList<>();
        List<TimetableEntry.DayOfWeek> dayOrder = Arrays.asList(
                TimetableEntry.DayOfWeek.MONDAY,
                TimetableEntry.DayOfWeek.TUESDAY,
                TimetableEntry.DayOfWeek.WEDNESDAY,
                TimetableEntry.DayOfWeek.THURSDAY,
                TimetableEntry.DayOfWeek.FRIDAY,
                TimetableEntry.DayOfWeek.SATURDAY
        );
        int maxPerDay = Math.max(1, (needed + 5) / 6);

        for (int round = 0; round < 10 && result.size() < needed; round++) {
            for (TimetableEntry.DayOfWeek day : dayOrder) {
                List<Integer> slots = byDay.get(day);
                if (slots != null && round < slots.size()) {
                    long placedOnDay = result.stream().filter(s -> s.day() == day).count();
                    if (placedOnDay < maxPerDay) {
                        result.add(new SlotKey(day, slots.get(round)));
                        if (result.size() >= needed) break;
                    }
                }
            }
        }
        return result;
    }

    // ─── Mapping helpers ─────────────────────────────────────────────────────────

    private List<TimetableEntryResponse> toResponses(List<TimetableEntry> entries) {
        if (entries.isEmpty()) return Collections.emptyList();

        Set<UUID> classroomIds = entries.stream().map(TimetableEntry::getClassroomId).collect(Collectors.toSet());
        Set<UUID> subjectIds = entries.stream().map(TimetableEntry::getSubjectId).collect(Collectors.toSet());
        Set<UUID> teacherIds = entries.stream()
                .map(TimetableEntry::getTeacherId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, String> classroomNameMap = classroomRepo.findAllById(classroomIds).stream()
                .collect(Collectors.toMap(Classroom::getId, Classroom::getName));
        Map<UUID, Subject> subjectMap = subjectRepo.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getId, Function.identity()));
        Map<UUID, String> teacherNameMap = teacherIds.isEmpty() ? Collections.emptyMap() :
                userRepo.findAllById(teacherIds).stream()
                        .collect(Collectors.toMap(User::getId, User::getDisplayName));

        return entries.stream()
                .map(e -> buildResponse(e, classroomNameMap, subjectMap, teacherNameMap))
                .collect(Collectors.toList());
    }

    TimetableEntryResponse toResponse(TimetableEntry e) {
        String classroomName = classroomRepo.findById(e.getClassroomId())
                .map(Classroom::getName).orElse(null);
        Subject subject = subjectRepo.findById(e.getSubjectId()).orElse(null);
        String teacherName = e.getTeacherId() != null
                ? userRepo.findById(e.getTeacherId()).map(User::getDisplayName).orElse(null)
                : null;
        return new TimetableEntryResponse(
                e.getId(),
                e.getClassroomId(),
                classroomName,
                e.getSubjectId(),
                subject != null ? subject.getName() : null,
                subject != null ? subject.getCode() : null,
                subject != null ? subject.getColorHex() : null,
                e.getTeacherId(),
                teacherName,
                e.getDayOfWeek() != null ? e.getDayOfWeek().name() : null,
                e.getPeriod(),
                e.getAcademicYear(),
                e.getSemester(),
                e.getCreatedAt()
        );
    }

    private TimetableEntryResponse buildResponse(TimetableEntry e,
                                                  Map<UUID, String> classroomNameMap,
                                                  Map<UUID, Subject> subjectMap,
                                                  Map<UUID, String> teacherNameMap) {
        Subject subject = subjectMap.get(e.getSubjectId());
        return new TimetableEntryResponse(
                e.getId(),
                e.getClassroomId(),
                classroomNameMap.get(e.getClassroomId()),
                e.getSubjectId(),
                subject != null ? subject.getName() : null,
                subject != null ? subject.getCode() : null,
                subject != null ? subject.getColorHex() : null,
                e.getTeacherId(),
                e.getTeacherId() != null ? teacherNameMap.get(e.getTeacherId()) : null,
                e.getDayOfWeek() != null ? e.getDayOfWeek().name() : null,
                e.getPeriod(),
                e.getAcademicYear(),
                e.getSemester(),
                e.getCreatedAt()
        );
    }

    private TimetableEntry.DayOfWeek parseDayOfWeek(String value) {
        try {
            return TimetableEntry.DayOfWeek.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Giá trị ngày không hợp lệ: " + value);
        }
    }

    // ─── Classroom subject configs ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ClassroomSubjectConfigResponse> getConfigs(UUID classroomId) {
        List<ClassroomSubjectConfig> configs = classroomId != null
                ? configRepo.findByClassroomId(classroomId)
                : configRepo.findAll();
        return toConfigResponses(configs);
    }

    public ClassroomSubjectConfigResponse saveConfig(SaveClassroomSubjectConfigRequest req) {
        if (!classroomRepo.existsById(req.classroomId())) {
            throw new BusinessException(ErrorCode.CLASSROOM_NOT_FOUND);
        }
        if (!subjectRepo.existsById(req.subjectId())) {
            throw new BusinessException(ErrorCode.SUBJECT_NOT_FOUND);
        }
        // Upsert: if already exists for this (classroom, subject), update it
        ClassroomSubjectConfig config = configRepo
                .findByClassroomIdAndSubjectId(req.classroomId(), req.subjectId())
                .orElseGet(ClassroomSubjectConfig::new);
        config.setClassroomId(req.classroomId());
        config.setSubjectId(req.subjectId());
        config.setTeacherId(req.teacherId());
        config.setPeriodsPerWeek(req.periodsPerWeek());
        return toConfigResponse(configRepo.save(config));
    }

    public void deleteConfig(UUID id) {
        if (!configRepo.existsById(id)) {
            throw new BusinessException(ErrorCode.TIMETABLE_ENTRY_NOT_FOUND);
        }
        configRepo.deleteById(id);
    }

    /** Generate timetable from pre-saved classroom subject configs. */
    public GenerateTimetableResponse generateFromConfig(GenerateFromConfigRequest req, UUID requesterId) {
        List<UUID> targetIds = (req.classroomIds() == null || req.classroomIds().isEmpty())
                ? null
                : req.classroomIds();

        List<ClassroomSubjectConfig> configs = targetIds == null
                ? configRepo.findAll()
                : configRepo.findByClassroomIdIn(targetIds);

        if (configs.isEmpty()) {
            return new GenerateTimetableResponse(Collections.emptyList(),
                    List.of("Không có cấu hình chương trình học. Hãy vào tab 'Chương trình học' để thêm."));
        }

        // Group configs by classroom, then delegate to existing generate()
        Map<UUID, List<ClassroomSubjectConfig>> byClassroom = configs.stream()
                .collect(Collectors.groupingBy(ClassroomSubjectConfig::getClassroomId));

        List<GenerateTimetableRequest.ClassroomSpec> specs = byClassroom.entrySet().stream()
                .map(e -> new GenerateTimetableRequest.ClassroomSpec(
                        e.getKey(),
                        e.getValue().stream()
                                .map(c -> new GenerateTimetableRequest.SubjectAssignment(
                                        c.getSubjectId(), c.getTeacherId(), c.getPeriodsPerWeek()))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        return generate(new GenerateTimetableRequest(
                req.academicYear(), req.semester(), req.clearExisting(), specs), requesterId);
    }

    // ─── Config mapping helpers ──────────────────────────────────────────────────

    private List<ClassroomSubjectConfigResponse> toConfigResponses(List<ClassroomSubjectConfig> configs) {
        if (configs.isEmpty()) return Collections.emptyList();

        Set<UUID> classroomIds = configs.stream().map(ClassroomSubjectConfig::getClassroomId).collect(Collectors.toSet());
        Set<UUID> subjectIds   = configs.stream().map(ClassroomSubjectConfig::getSubjectId).collect(Collectors.toSet());
        Set<UUID> teacherIds   = configs.stream()
                .map(ClassroomSubjectConfig::getTeacherId).filter(Objects::nonNull).collect(Collectors.toSet());

        Map<UUID, String> classroomNames = classroomRepo.findAllById(classroomIds).stream()
                .collect(Collectors.toMap(Classroom::getId, Classroom::getName));
        Map<UUID, Subject> subjectMap = subjectRepo.findAllById(subjectIds).stream()
                .collect(Collectors.toMap(Subject::getId, Function.identity()));
        Map<UUID, String> teacherNames = teacherIds.isEmpty() ? Collections.emptyMap() :
                userRepo.findAllById(teacherIds).stream()
                        .collect(Collectors.toMap(User::getId, User::getDisplayName));

        return configs.stream().map(c -> {
            Subject s = subjectMap.get(c.getSubjectId());
            return new ClassroomSubjectConfigResponse(
                    c.getId(),
                    c.getClassroomId(),
                    classroomNames.get(c.getClassroomId()),
                    c.getSubjectId(),
                    s != null ? s.getName() : null,
                    s != null ? s.getCode() : null,
                    s != null ? s.getColorHex() : null,
                    c.getTeacherId(),
                    c.getTeacherId() != null ? teacherNames.get(c.getTeacherId()) : null,
                    c.getPeriodsPerWeek(),
                    c.getCreatedAt()
            );
        }).collect(Collectors.toList());
    }

    private ClassroomSubjectConfigResponse toConfigResponse(ClassroomSubjectConfig c) {
        return toConfigResponses(List.of(c)).get(0);
    }
}
