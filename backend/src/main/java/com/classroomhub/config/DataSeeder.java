package com.classroomhub.config;

import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.classroom.entity.Classroom;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.repository.ClassroomMemberRepository;
import com.classroomhub.domain.classroom.repository.ClassroomRepository;
import com.classroomhub.domain.duty.entity.DutyType;
import com.classroomhub.domain.duty.repository.DutyTypeRepository;
import com.classroomhub.domain.emulation.entity.EmulationCategory;
import com.classroomhub.domain.emulation.repository.EmulationCategoryRepository;
import com.classroomhub.domain.fund.entity.Fund;
import com.classroomhub.domain.fund.repository.FundRepository;
import com.classroomhub.domain.group.entity.Group;
import com.classroomhub.domain.group.entity.GroupMember;
import com.classroomhub.domain.group.repository.GroupMemberRepository;
import com.classroomhub.domain.group.repository.GroupRepository;
import com.classroomhub.domain.timetable.entity.Subject;
import com.classroomhub.domain.timetable.entity.ClassroomSubjectConfig;
import com.classroomhub.domain.timetable.entity.TeacherSubject;
import com.classroomhub.domain.timetable.repository.ClassroomSubjectConfigRepository;
import com.classroomhub.domain.timetable.repository.SubjectRepository;
import com.classroomhub.domain.timetable.repository.TeacherSubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Component
@Profile("!prod")
@RequiredArgsConstructor
@Order(10)
public class DataSeeder {

    private final UserRepository              userRepo;
    private final ClassroomRepository         classroomRepo;
    private final ClassroomMemberRepository   memberRepo;
    private final GroupRepository             groupRepo;
    private final GroupMemberRepository       groupMemberRepo;
    private final SubjectRepository           subjectRepo;
    private final TeacherSubjectRepository    teacherSubjectRepo;
    private final ClassroomSubjectConfigRepository configRepo;
    private final FundRepository              fundRepo;
    private final EmulationCategoryRepository emulationRepo;
    private final DutyTypeRepository          dutyTypeRepo;
    private final PasswordEncoder             passwordEncoder;

    private static final String PASSWORD     = "Demo@123456";
    private static final String YEAR         = "2024-2025";
    private static final int    SEMESTER     = 2;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seed() {
        if (userRepo.existsByUserType(User.UserType.TEACHER)) {
            log.info("[DataSeeder] Dữ liệu mẫu đã tồn tại — bỏ qua.");
            return;
        }
        log.info("[DataSeeder] Bắt đầu tạo dữ liệu mẫu...");

        String hash = passwordEncoder.encode(PASSWORD);

        // ── 1. Giáo viên ──────────────────────────────────────────────────────
        User gvToan   = teacher("gv.toan@school.edu.vn",   hash, "Nguyễn Văn An");
        User gvVan    = teacher("gv.van@school.edu.vn",    hash, "Trần Thị Bình");
        User gvAnh    = teacher("gv.anh@school.edu.vn",    hash, "Lê Minh Cường");
        User gvLy     = teacher("gv.ly@school.edu.vn",     hash, "Phạm Hồng Dung");
        User gvHoa    = teacher("gv.hoa@school.edu.vn",    hash, "Hoàng Văn Em");
        User gvSinh   = teacher("gv.sinh@school.edu.vn",   hash, "Đặng Thị Phương");
        User gvTin    = teacher("gv.tin@school.edu.vn",    hash, "Võ Quốc Tuấn");
        User gvTD     = teacher("gv.theduc@school.edu.vn", hash, "Bùi Thanh Hải");

        // ── 2. Học sinh 12A1 (10 em) ─────────────────────────────────────────
        List<User> s12 = students(hash,
            "Đinh Thành Đạt",    "hs.dat12@school.edu.vn",   "STU-12A101",
            "Ngô Ngọc Hà",       "hs.ha12@school.edu.vn",    "STU-12A102",
            "Lý Minh Khoa",      "hs.khoa12@school.edu.vn",  "STU-12A103",
            "Trịnh Thị Lan",     "hs.lan12@school.edu.vn",   "STU-12A104",
            "Dương Văn Long",    "hs.long12@school.edu.vn",  "STU-12A105",
            "Hà Thị Mai",        "hs.mai12@school.edu.vn",   "STU-12A106",
            "Tạ Quang Nam",      "hs.nam12@school.edu.vn",   "STU-12A107",
            "Bùi Thị Oanh",      "hs.oanh12@school.edu.vn",  "STU-12A108",
            "Chu Văn Phong",     "hs.phong12@school.edu.vn", "STU-12A109",
            "Lưu Thị Quỳnh",     "hs.quynh12@school.edu.vn", "STU-12A110"
        );

        // ── 3. Học sinh 11B2 (10 em) ─────────────────────────────────────────
        List<User> s11 = students(hash,
            "Trần Bảo An",       "hs.an11@school.edu.vn",    "STU-11B201",
            "Nguyễn Thị Cẩm",    "hs.cam11@school.edu.vn",   "STU-11B202",
            "Phạm Văn Đức",      "hs.duc11@school.edu.vn",   "STU-11B203",
            "Vũ Thị Giang",      "hs.giang11@school.edu.vn", "STU-11B204",
            "Hoàng Văn Hùng",    "hs.hung11@school.edu.vn",  "STU-11B205",
            "Đỗ Thị Kim",        "hs.kim11@school.edu.vn",   "STU-11B206",
            "Lê Văn Lâm",        "hs.lam11@school.edu.vn",   "STU-11B207",
            "Mai Thị Ngân",      "hs.ngan11@school.edu.vn",  "STU-11B208",
            "Phan Văn Quý",      "hs.quy11@school.edu.vn",   "STU-11B209",
            "Đinh Thị Thu",      "hs.thu11@school.edu.vn",   "STU-11B210"
        );

        // ── 4. Học sinh 10C3 (10 em) ─────────────────────────────────────────
        List<User> s10 = students(hash,
            "Nguyễn Anh Dũng",   "hs.dung10@school.edu.vn",  "STU-10C301",
            "Trần Thị Hạnh",     "hs.hanh10@school.edu.vn",  "STU-10C302",
            "Lê Văn Khánh",      "hs.khanh10@school.edu.vn", "STU-10C303",
            "Phạm Thị Linh",     "hs.linh10@school.edu.vn",  "STU-10C304",
            "Vũ Minh Nhật",      "hs.nhat10@school.edu.vn",  "STU-10C305",
            "Hoàng Thị Phúc",    "hs.phuc10@school.edu.vn",  "STU-10C306",
            "Đặng Văn Sơn",      "hs.son10@school.edu.vn",   "STU-10C307",
            "Bùi Thị Tâm",       "hs.tam10@school.edu.vn",   "STU-10C308",
            "Chu Văn Thiện",     "hs.thien10@school.edu.vn", "STU-10C309",
            "Lưu Thị Xuân",      "hs.xuan10@school.edu.vn",  "STU-10C310"
        );

        // ── 5. Phụ huynh ─────────────────────────────────────────────────────
        parent(hash, "Đinh Văn Bá",    "ph.ba@gmail.com");    // bố của Đinh Thành Đạt
        parent(hash, "Trần Văn Hải",   "ph.hai@gmail.com");   // bố của Trần Bảo An
        parent(hash, "Nguyễn Thị Lan", "ph.lan@gmail.com");   // mẹ của Nguyễn Anh Dũng

        // ── 6. Môn học ───────────────────────────────────────────────────────
        Subject toan = subject("Toán",         "TOAN",  "#3B82F6", 4);
        Subject van  = subject("Ngữ Văn",      "VAN",   "#A855F7", 3);
        Subject anh  = subject("Tiếng Anh",    "ANH",   "#10B981", 3);
        Subject ly   = subject("Vật Lý",       "LY",    "#F59E0B", 2);
        Subject hoa  = subject("Hóa Học",      "HOA",   "#EF4444", 2);
        Subject sinh = subject("Sinh Học",     "SINH",  "#84CC16", 2);
        Subject su   = subject("Lịch Sử",      "SU",    "#F97316", 1);
        Subject dia  = subject("Địa Lý",       "DIA",   "#06B6D4", 1);
        Subject gdcd = subject("GDCD",         "GDCD",  "#8B5CF6", 1);
        Subject tin  = subject("Tin Học",      "TIN",   "#6366F1", 2);
        Subject td   = subject("Thể Dục",      "THEDUC","#14B8A6", 2);
        Subject cn   = subject("Công Nghệ",    "CONGNGHE","#D97706",1);

        // ── 7. Teacher-Subject ───────────────────────────────────────────────
        assignSubjects(gvToan, toan, ly);
        assignSubjects(gvVan,  van,  su, dia, gdcd);
        assignSubjects(gvAnh,  anh);
        assignSubjects(gvLy,   ly,   cn);
        assignSubjects(gvHoa,  hoa,  sinh);
        assignSubjects(gvSinh, sinh);
        assignSubjects(gvTin,  tin);
        assignSubjects(gvTD,   td);

        // ── 8. Lớp học ───────────────────────────────────────────────────────
        Classroom c12 = classroom("12A1 - Ban Khoa học Tự nhiên",
            "Lớp chọn khối A, định hướng Toán Lý Hóa. Năm học 2024-2025.", "CLS-12A1", gvToan);
        Classroom c11 = classroom("11B2 - Ban Khoa học Xã hội",
            "Lớp chọn khối C, định hướng Văn Sử Địa. Năm học 2024-2025.", "CLS-11B2", gvVan);
        Classroom c10 = classroom("10C3 - Ban Cơ bản",
            "Lớp cơ bản toàn diện, chú trọng ngoại ngữ và tin học. Năm học 2024-2025.", "CLS-10C3", gvAnh);

        // ── 9. Thành viên lớp ────────────────────────────────────────────────
        addOwner(c12, gvToan);
        addTeacher(c12, gvLy);
        addTeacher(c12, gvHoa);
        addTeacher(c12, gvAnh);
        addTeacher(c12, gvTD);
        addStudents(c12, s12, ClassroomMember.Role.MONITOR,      0);  // Đạt: lớp trưởng
        addStudents(c12, s12, ClassroomMember.Role.VICE_MONITOR, 1);  // Hà: lớp phó
        addStudents(c12, s12, ClassroomMember.Role.TREASURER,    8);  // Phong: thủ quỹ
        addStudents(c12, s12, ClassroomMember.Role.SECRETARY,    9);  // Quỳnh: thư ký
        for (int i = 2; i <= 7; i++) addStudents(c12, s12, ClassroomMember.Role.MEMBER, i);

        addOwner(c11, gvVan);
        addTeacher(c11, gvToan);
        addTeacher(c11, gvAnh);
        addTeacher(c11, gvTD);
        addStudents(c11, s11, ClassroomMember.Role.MONITOR,      0);  // An: lớp trưởng
        addStudents(c11, s11, ClassroomMember.Role.VICE_MONITOR, 1);  // Cẩm: lớp phó
        addStudents(c11, s11, ClassroomMember.Role.TREASURER,    8);  // Quý: thủ quỹ
        addStudents(c11, s11, ClassroomMember.Role.SECRETARY,    9);  // Thu: thư ký
        for (int i = 2; i <= 7; i++) addStudents(c11, s11, ClassroomMember.Role.MEMBER, i);

        addOwner(c10, gvAnh);
        addTeacher(c10, gvToan);
        addTeacher(c10, gvVan);
        addTeacher(c10, gvTin);
        addTeacher(c10, gvTD);
        addStudents(c10, s10, ClassroomMember.Role.MONITOR,      0);  // Dũng: lớp trưởng
        addStudents(c10, s10, ClassroomMember.Role.VICE_MONITOR, 1);  // Hạnh: lớp phó
        addStudents(c10, s10, ClassroomMember.Role.TREASURER,    8);  // Thiện: thủ quỹ
        addStudents(c10, s10, ClassroomMember.Role.SECRETARY,    9);  // Xuân: thư ký
        for (int i = 2; i <= 7; i++) addStudents(c10, s10, ClassroomMember.Role.MEMBER, i);

        // ── 10. Nhóm / Tổ ────────────────────────────────────────────────────
        seedGroups(c12, s12, gvToan);
        seedGroups(c11, s11, gvVan);
        seedGroups(c10, s10, gvAnh);

        // ── 11. Classroom subject configs ────────────────────────────────────
        for (Subject s : List.of(toan, van, anh, ly, hoa, sinh, su, dia, gdcd, tin, td, cn)) {
            seedConfig(c12, s);
            seedConfig(c11, s);
            seedConfig(c10, s);
        }

        // ── 15. Quỹ lớp ──────────────────────────────────────────────────────
        seedFund(c12, "Quỹ lớp 12A1",  "Quỹ hoạt động lớp 12A1 năm học 2024-2025");
        seedFund(c11, "Quỹ lớp 11B2",  "Quỹ hoạt động lớp 11B2 năm học 2024-2025");
        seedFund(c10, "Quỹ lớp 10C3",  "Quỹ hoạt động lớp 10C3 năm học 2024-2025");

        // ── 16. Thi đua ───────────────────────────────────────────────────────
        for (Classroom c : List.of(c12, c11, c10)) {
            seedEmulation(c);
        }

        // ── 17. Trực nhật ────────────────────────────────────────────────────
        for (Classroom c : List.of(c12, c11, c10)) {
            seedDutyTypes(c);
        }

        log.info("[DataSeeder] ✅ Hoàn thành seed dữ liệu mẫu!");
        log.info("================================================");
        log.info("  Tất cả tài khoản dùng mật khẩu: {}", PASSWORD);
        log.info("  Giáo viên chủ nhiệm 12A1: gv.toan@school.edu.vn");
        log.info("  Giáo viên chủ nhiệm 11B2: gv.van@school.edu.vn");
        log.info("  Giáo viên chủ nhiệm 10C3: gv.anh@school.edu.vn");
        log.info("  Học sinh mẫu 12A1:        hs.dat12@school.edu.vn");
        log.info("  Phụ huynh mẫu:            ph.ba@gmail.com");
        log.info("================================================");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User teacher(String email, String hash, String name) {
        return userRepo.save(User.builder()
            .email(email).passwordHash(hash).displayName(name)
            .userType(User.UserType.TEACHER).status(User.Status.ACTIVE).build());
    }

    private User parent(String hash, String name, String email) {
        return userRepo.save(User.builder()
            .email(email).passwordHash(hash).displayName(name)
            .userType(User.UserType.PARENT).status(User.Status.ACTIVE).build());
    }

    /** Nhận chuỗi varargs: name, email, code lặp lại */
    private List<User> students(String hash, String... args) {
        List<User> list = new ArrayList<>();
        for (int i = 0; i < args.length; i += 3) {
            list.add(userRepo.save(User.builder()
                .email(args[i + 1]).passwordHash(hash).displayName(args[i])
                .userType(User.UserType.STUDENT).studentCode(args[i + 2])
                .status(User.Status.ACTIVE).build()));
        }
        return list;
    }

    private Subject subject(String name, String code, String color, int periodsPerWeek) {
        return subjectRepo.findByCode(code).orElseGet(() ->
            subjectRepo.save(Subject.builder()
                .name(name).code(code).colorHex(color).periodsPerWeek(periodsPerWeek).build()));
    }

    private void assignSubjects(User teacher, Subject... subjects) {
        for (Subject s : subjects) {
            if (!teacherSubjectRepo.existsByTeacherIdAndSubjectId(teacher.getId(), s.getId())) {
                teacherSubjectRepo.save(TeacherSubject.builder()
                    .teacherId(teacher.getId()).subjectId(s.getId()).build());
            }
        }
    }

    private Classroom classroom(String name, String desc, String code, User owner) {
        return classroomRepo.save(Classroom.builder()
            .name(name).description(desc).inviteCode(code)
            .ownerId(owner.getId()).maxMembers(50).status(Classroom.Status.ACTIVE).build());
    }

    private void addOwner(Classroom c, User u) {
        memberRepo.save(ClassroomMember.builder()
            .classroomId(c.getId()).userId(u.getId())
            .role(ClassroomMember.Role.OWNER).build());
    }

    private void addTeacher(Classroom c, User u) {
        memberRepo.save(ClassroomMember.builder()
            .classroomId(c.getId()).userId(u.getId())
            .role(ClassroomMember.Role.TEACHER).build());
    }

    private void addStudents(Classroom c, List<User> students, ClassroomMember.Role role, int idx) {
        User u = students.get(idx);
        memberRepo.save(ClassroomMember.builder()
            .classroomId(c.getId()).userId(u.getId())
            .role(role).build());
    }

    private void seedGroups(Classroom c, List<User> students, User leader) {
        String[] names  = {"Tổ 1", "Tổ 2", "Tổ 3"};
        String[] colors = {"#3B82F6", "#10B981", "#F59E0B"};
        // Chia đều 10 học sinh vào 3 tổ: 4 / 3 / 3
        int[][] slices = {{0,3}, {4,6}, {7,9}};

        for (int t = 0; t < 3; t++) {
            User groupLeader = students.get(slices[t][0]);
            Group g = groupRepo.save(Group.builder()
                .classroomId(c.getId()).name(names[t]).color(colors[t])
                .leaderId(groupLeader.getId()).build());
            for (int i = slices[t][0]; i <= slices[t][1]; i++) {
                User student = students.get(i);
                ClassroomMember cm = memberRepo.findByClassroomIdAndUserId(c.getId(), student.getId())
                    .orElseThrow(() -> new IllegalStateException("ClassroomMember không tìm thấy khi seed group"));
                groupMemberRepo.save(GroupMember.builder()
                    .groupId(g.getId()).userId(student.getId())
                    .classroomMemberId(cm.getId()).build());
            }
        }
    }

    private void seedConfig(Classroom c, Subject s) {
        if (!configRepo.existsByClassroomIdAndSubjectId(c.getId(), s.getId())) {
            configRepo.save(ClassroomSubjectConfig.builder()
                .classroomId(c.getId()).subjectId(s.getId())
                .periodsPerWeek(s.getPeriodsPerWeek()).build());
        }
    }

    private void seedFund(Classroom c, String name, String desc) {
        if (fundRepo.findByClassroomId(c.getId()).isEmpty()) {
            fundRepo.save(Fund.builder()
                .classroomId(c.getId()).name(name).description(desc)
                .balance(BigDecimal.ZERO).build());
        }
    }

    private void seedEmulation(Classroom c) {
        Object[][] cats = {
            {"Vắng không phép",     "Nghỉ học không có lý do",          -5},
            {"Vắng có phép",        "Nghỉ học có đơn xin phép",         -2},
            {"Đi muộn",             "Đến lớp trễ giờ quy định",         -2},
            {"Vi phạm nội quy",     "Mặc sai đồng phục, sử dụng điện thoại...", -3},
            {"Phát biểu tích cực",  "Xung phong phát biểu xây dựng bài", 2},
            {"Đạt điểm 10",         "Đạt điểm tuyệt đối trong bài kiểm tra", 3},
            {"Nhặt được của rơi",   "Trả lại tài sản tìm được cho chủ",  5},
            {"Đại diện thi HSG",    "Tham gia thi học sinh giỏi cấp trường trở lên", 10},
        };
        for (Object[] row : cats) {
            emulationRepo.save(EmulationCategory.builder()
                .classroomId(c.getId()).name((String) row[0])
                .description((String) row[1]).defaultScore((int) row[2])
                .active(true).build());
        }
    }

    private void seedDutyTypes(Classroom c) {
        String[][] types = {
            {"Trực vệ sinh lớp",  "Quét dọn, lau bảng, đổ rác sau giờ học"},
            {"Trực cửa sổ",       "Mở/đóng cửa sổ, kiểm tra quạt điện trước khi ra về"},
            {"Trực bảng",         "Xoá bảng, chuẩn bị phấn cho giáo viên"},
            {"Trực điểm danh",    "Điểm danh sĩ số và báo cáo lớp trưởng"},
            {"Trực tắt điện",     "Kiểm tra và tắt đèn, quạt khi hết tiết cuối"},
        };
        for (String[] t : types) {
            dutyTypeRepo.save(DutyType.builder()
                .classroomId(c.getId()).name(t[0]).description(t[1]).build());
        }
    }
}
