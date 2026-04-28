# Hệ thống Xếp Thời Khoá Biểu — Tài liệu Kỹ thuật & Nghiệp vụ

> **Phiên bản:** 1.0 — Cập nhật: 2026-04-27

---

## 1. Tổng quan nghiệp vụ (Business Overview)

### 1.1 Vấn đề cần giải quyết

Một trường học hoặc trung tâm giáo dục cần lên lịch dạy–học định kỳ (theo học kỳ) cho toàn bộ các lớp học. Quá trình này thủ công rất tốn thời gian vì phải đảm bảo:

- Mỗi lớp đủ số tiết theo môn học quy định.
- Không có giáo viên nào bị trùng lịch (dạy 2 lớp cùng một tiết).
- Không có lớp nào bị trùng lịch (2 môn cùng một tiết).
- Tiết học được phân bổ đều qua các ngày trong tuần, tránh dồn.

Hệ thống này tự động hoá quá trình đó và cho phép chỉnh sửa linh hoạt sau khi tạo.

### 1.2 Các vai trò người dùng

| Vai trò | Quyền |
|---|---|
| **Admin trường / Cán bộ quản lý** (`SYSTEM_ADMIN`) | Quản lý môn học, phân công GV, tạo/sửa/xóa thời khoá biểu, chạy thuật toán tự động |
| **Giáo viên** (`TEACHER`) | Xem lịch dạy của bản thân, gửi yêu cầu đổi lịch với giáo viên khác |
| **Học sinh** (`STUDENT`) | Xem thời khoá biểu lớp mình đang học (chỉ đọc) |

### 1.3 Luồng nghiệp vụ chính

```
Admin nhập dữ liệu đầu vào
        │
        ├─ 1. Tạo danh sách môn học (Toán, Văn, Anh, ...)
        │      + số tiết/tuần mỗi môn
        │      + màu sắc hiển thị trên lịch
        │
        ├─ 2. Phân công GV dạy môn
        │      (GV A → Toán, GV B → Văn, ...)
        │
        ├─ 3. Chạy tự động xếp lịch cho toàn trường
        │      Input: Chọn các lớp + môn học + GV + số tiết/tuần
        │      Output: Thời khoá biểu đầy đủ cho tất cả lớp
        │
        └─ 4. Chỉnh sửa thủ công nếu cần
               (thêm/xóa/sửa từng tiết)

Giáo viên xem lịch dạy cá nhân
        └─ Nếu cần đổi lịch → gửi yêu cầu đổi → GV kia duyệt

Học sinh xem thời khoá biểu lớp (chỉ đọc)
```

---

## 2. Mô hình dữ liệu (Data Model)

### 2.1 Sơ đồ thực thể (ERD)

```
┌──────────────┐       ┌───────────────────┐       ┌──────────────────┐
│   subjects   │       │  teacher_subjects │       │      users       │
│──────────────│       │───────────────────│       │──────────────────│
│ id (UUID)    │◄──────│ subject_id (FK)   │──────►│ id (UUID)        │
│ name         │       │ teacher_id (FK)   │       │ display_name     │
│ code         │       │ id (UUID)         │       │ user_type        │
│ periods/week │       └───────────────────┘       └──────────────────┘
│ color_hex    │                                           │
└──────┬───────┘                                           │
       │                                                   │
       │         ┌──────────────────────────┐              │
       │         │     timetable_entries    │              │
       └────────►│──────────────────────────│◄─────────────┘
                 │ id (UUID)                │
                 │ classroom_id (FK)        │◄── classrooms
                 │ subject_id (FK)          │
                 │ teacher_id (FK, nullable)│
                 │ day_of_week (enum)       │
                 │ period (1–10)            │
                 │ academic_year            │
                 │ semester (1 or 2)        │
                 └──────────┬───────────────┘
                            │
                            │
              ┌─────────────▼────────────┐
              │       swap_requests      │
              │──────────────────────────│
              │ requester_id (FK)        │
              │ requester_entry_id (FK)  │
              │ target_teacher_id (FK)   │
              │ target_entry_id (FK,opt) │
              │ status (PENDING/...)     │
              │ reason                   │
              └──────────────────────────┘
```

### 2.2 Mô tả các bảng

#### `subjects` — Môn học
| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | UUID | Khoá chính |
| `name` | VARCHAR(100) | Tên đầy đủ: "Toán", "Ngữ Văn", ... |
| `code` | VARCHAR(20) | Mã môn: "MATH", "LIT", "ENG", ... |
| `periods_per_week` | INT | Số tiết mặc định/tuần (có thể ghi đè khi tạo lịch) |
| `color_hex` | VARCHAR(7) | Màu hiển thị trên lịch, VD: `#4F81BD` |

#### `teacher_subjects` — Phân công GV dạy môn
Bảng trung gian nhiều-nhiều: một GV có thể dạy nhiều môn, một môn có thể do nhiều GV dạy.

| Cột | Mô tả |
|---|---|
| `teacher_id` | UUID của user có `user_type = TEACHER` |
| `subject_id` | UUID môn học |

**Ràng buộc:** `UNIQUE(teacher_id, subject_id)` — không phân công trùng.

#### `timetable_entries` — Các tiết học trong thời khoá biểu
Đây là bảng trung tâm. Mỗi dòng = một tiết học cụ thể trong tuần.

| Cột | Mô tả |
|---|---|
| `classroom_id` | Lớp nào học tiết này |
| `subject_id` | Môn học gì |
| `teacher_id` | GV dạy (nullable — có thể chưa phân công) |
| `day_of_week` | Thứ trong tuần: MONDAY, TUESDAY, ... SATURDAY |
| `period` | Tiết học: 1–10 |
| `academic_year` | Năm học: `"2024-2025"` |
| `semester` | Học kỳ: 1 hoặc 2 |

**Ràng buộc toàn vẹn:**
- `UNIQUE(classroom_id, day_of_week, period, academic_year, semester)` — mỗi lớp chỉ có 1 tiết trong 1 slot
- `UNIQUE(teacher_id, day_of_week, period, academic_year, semester)` — mỗi GV chỉ dạy 1 tiết trong 1 slot

#### `swap_requests` — Yêu cầu đổi lịch
| Cột | Mô tả |
|---|---|
| `requester_id` | GV gửi yêu cầu |
| `requester_entry_id` | Tiết GV muốn nhường/đổi đi |
| `target_teacher_id` | GV được yêu cầu đổi |
| `target_entry_id` | Tiết của GV kia (tuỳ chọn — nếu muốn đổi 2 chiều) |
| `status` | `PENDING` → `APPROVED` / `REJECTED` / `CANCELLED` |

---

## 3. API Reference

Base URL: `/api/v1/timetable`

### 3.1 Môn học

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/subjects` | Authenticated | Lấy danh sách tất cả môn học |
| POST | `/subjects` | ADMIN | Tạo môn học mới |
| PUT | `/subjects/{id}` | ADMIN | Cập nhật môn học |
| DELETE | `/subjects/{id}` | ADMIN | Xóa môn học |

### 3.2 Phân công GV

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/teacher-subjects` | ADMIN | Danh sách phân công |
| POST | `/teacher-subjects` | ADMIN | Phân công GV ↔ môn học |
| DELETE | `/teacher-subjects/{id}` | ADMIN | Hủy phân công |

### 3.3 Thời khoá biểu

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/entries?classroomId=&academicYear=&semester=` | Authenticated | Lấy TKB của một lớp |
| POST | `/entries` | ADMIN | Tạo thủ công 1 tiết |
| PUT | `/entries/{id}` | ADMIN | Sửa 1 tiết |
| DELETE | `/entries/{id}` | ADMIN | Xóa 1 tiết |
| **POST** | **`/entries/generate`** | ADMIN | **Tự động xếp lịch toàn trường** |
| GET | `/me?academicYear=&semester=` | Authenticated | Lịch cá nhân (GV: lịch dạy; HS: TKB lớp) |

### 3.4 Đổi lịch

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/swaps` | Teacher | Danh sách yêu cầu liên quan đến tôi |
| POST | `/swaps` | Teacher | Gửi yêu cầu đổi lịch |
| POST | `/swaps/{id}/approve` | Teacher (target) | Duyệt yêu cầu |
| POST | `/swaps/{id}/reject` | Teacher (target) | Từ chối yêu cầu |
| DELETE | `/swaps/{id}` | Teacher (requester) | Hủy yêu cầu |

---

## 4. Thuật toán Xếp lịch Tự động

### 4.1 Tổng quan

Thuật toán sử dụng phương pháp **Greedy (tham lam) với Day-Interleaving** — phân bổ tiết học đều qua các ngày trong tuần, trong khi kiểm tra liên tục các ràng buộc xung đột.

> **Không phải backtracking:** Thuật toán không thử lại khi gặp xung đột cục bộ. Nó ưu tiên tốc độ và tính dự đoán được (deterministic), phù hợp với trường học vừa và nhỏ có ≤ 100 lớp.

### 4.2 Input của thuật toán

```json
{
  "academicYear": "2024-2025",
  "semester": 1,
  "clearExisting": true,
  "classrooms": [
    {
      "classroomId": "uuid-lop-10a",
      "assignments": [
        { "subjectId": "uuid-toan", "teacherId": "uuid-gv-nguyen", "periodsPerWeek": 4 },
        { "subjectId": "uuid-van",  "teacherId": "uuid-gv-tran",   "periodsPerWeek": 3 },
        { "subjectId": "uuid-anh",  "teacherId": "uuid-gv-le",     "periodsPerWeek": 3 }
      ]
    },
    {
      "classroomId": "uuid-lop-10b",
      "assignments": [
        { "subjectId": "uuid-toan", "teacherId": "uuid-gv-nguyen", "periodsPerWeek": 4 },
        { "subjectId": "uuid-van",  "teacherId": "uuid-gv-pham",   "periodsPerWeek": 3 }
      ]
    }
  ]
}
```

**Lưu ý quan trọng:** `classrooms` là **mảng** — admin có thể đưa vào **tất cả các lớp trong trường** cùng một lúc. Thuật toán sẽ xử lý toàn bộ và đảm bảo GV không bị trùng lịch giữa các lớp khác nhau.

### 4.3 Không gian slot khả dụng

Mỗi lớp có tối đa **60 slot** mỗi tuần:
- 6 ngày × 10 tiết = 60 slot
- Ngày: Thứ Hai (MONDAY) → Thứ Bảy (SATURDAY)
- Tiết 1–5: buổi sáng (7:00–11:05)
- Tiết 6–10: buổi chiều (13:00–17:05)

```
         T2    T3    T4    T5    T6    T7
Tiết 1  [  ]  [  ]  [  ]  [  ]  [  ]  [  ]
Tiết 2  [  ]  [  ]  [  ]  [  ]  [  ]  [  ]
Tiết 3  [  ]  [  ]  [  ]  [  ]  [  ]  [  ]
Tiết 4  [  ]  [  ]  [  ]  [  ]  [  ]  [  ]
Tiết 5  [  ]  [  ]  [  ]  [  ]  [  ]  [  ]
────── Nghỉ trưa ──────────────────────────
Tiết 6  [  ]  [  ]  [  ]  [  ]  [  ]  [  ]
Tiết 7  [  ]  [  ]  [  ]  [  ]  [  ]  [  ]
Tiết 8  [  ]  [  ]  [  ]  [  ]  [  ]  [  ]
Tiết 9  [  ]  [  ]  [  ]  [  ]  [  ]  [  ]
Tiết 10 [  ]  [  ]  [  ]  [  ]  [  ]  [  ]
```

### 4.4 Các bước thuật toán

```
INPUT: danh sách ClassroomSpec[], academicYear, semester, clearExisting

BƯỚC 1 — Chuẩn bị
  Nếu clearExisting = true:
    Xóa tất cả timetable_entries hiện tại của các lớp trong request

  Khởi tạo teacherOccupied = Map<teacherId → Set<"DAY_period">>
  (để theo dõi GV đã bận tiết nào, tích lũy khi xử lý từng lớp)

BƯỚC 2 — Xử lý từng lớp (tuần tự)
  FOR EACH classroomSpec IN classrooms:

    Tải classroomOccupied = Set các slot lớp này đã có
    
    Sắp xếp assignments: môn nhiều tiết/tuần xử lý trước
    (ưu tiên môn khó xếp hơn trước — heuristic cơ bản)

    FOR EACH assignment (subjectId, teacherId, periodsPerWeek):

      BƯỚC 2a — Tìm các slot khả dụng
      FOR EACH day IN [T2, T3, T4, T5, T6, T7]:
        FOR EACH period IN [1..10]:
          Nếu slot KHÔNG có trong classroomOccupied
          VÀ (teacherId = null HOẶC slot KHÔNG có trong teacherOccupied[teacherId]):
            → Thêm vào byDay[day]

      BƯỚC 2b — Chọn slot theo chiến lược Day-Interleaving
      Mục tiêu: phân bổ `periodsPerWeek` tiết đều qua các ngày
      maxPerDay = ceil(periodsPerWeek / 6)
      
      Vòng round = 1..10:
        FOR EACH day IN [T2..T7]:
          Nếu byDay[day][round] tồn tại
          VÀ số tiết đã chọn cho `day` < maxPerDay:
            → Chọn slot này
            Nếu đủ periodsPerWeek → dừng

      BƯỚC 2c — Ghi kết quả
      FOR EACH slot đã chọn:
        Tạo TimetableEntry và lưu vào DB
        Đánh dấu slot vào classroomOccupied
        Đánh dấu slot vào teacherOccupied[teacherId]

      Nếu số slot tìm được < periodsPerWeek:
        → Thêm thông báo conflict vào danh sách

BƯỚC 3 — Trả kết quả
  RETURN { entries: tất cả tiết đã tạo, conflicts: danh sách lỗi }
```

### 4.5 Ví dụ minh hoạ

**Trường hợp:** 2 lớp (10A, 10B), cùng GV dạy Toán (4 tiết/tuần mỗi lớp)

```
Lớp 10A — Toán (4 tiết), GV Nguyễn:
  maxPerDay = ceil(4/6) = 1

  Vòng 1: chọn T2-Tiết1 → classroomOccupied += {T2_1}, teacherOccupied[GV_Nguyễn] += {T2_1}
  Vòng 1: chọn T3-Tiết1 → T3_1 occupied
  Vòng 1: chọn T4-Tiết1 → T4_1 occupied
  Vòng 1: chọn T5-Tiết1 → T5_1 occupied
  → Hoàn thành 4 tiết, trải đều T2/T3/T4/T5

Lớp 10B — Toán (4 tiết), GV Nguyễn:
  Các slot {T2_1, T3_1, T4_1, T5_1} đã bị GV Nguyễn chiếm

  Vòng 1: T2-Tiết1 → BỊ CHẶN (GV Nguyễn bận)
  Vòng 1: T2-Tiết2 → OK → chọn T2_2
  Vòng 1: T3-Tiết2 → OK → chọn T3_2
  Vòng 1: T4-Tiết2 → OK → chọn T4_2
  Vòng 1: T5-Tiết2 → OK → chọn T5_2
  → Hoàn thành 4 tiết

Kết quả:
  10A Toán: T2-Tiết1, T3-Tiết1, T4-Tiết1, T5-Tiết1
  10B Toán: T2-Tiết2, T3-Tiết2, T4-Tiết2, T5-Tiết2
  ✓ Không xung đột GV
```

### 4.6 Xử lý xung đột

Khi không tìm đủ slot, thuật toán **không dừng lại** mà:
1. Đặt những tiết tìm được (số lượng < yêu cầu)
2. Thêm mô tả conflict vào response:
   > `"Không đủ slot cho môn Toán ở lớp 12A (cần 5, tìm được 3)"`
3. Admin nhận được danh sách conflicts và có thể chỉnh thủ công

**Nguyên nhân thường gặp:**
- GV dạy quá nhiều môn/lớp → không đủ slot trống
- Số tiết yêu cầu quá cao so với số ngày học
- Nhiều lớp cùng 1 GV, GV đó quá tải

### 4.7 Giới hạn hiện tại

| Hạn chế | Giải thích |
|---|---|
| Không backtracking | Nếu greedy chọn sai ở đầu, không thử lại → có thể tạo conflict không cần thiết |
| Không ràng buộc phòng học | Chưa có khái niệm "phòng học" — 2 lớp có thể dùng cùng phòng cùng tiết |
| Không ưu tiên GV | Chưa có slot "GV không muốn dạy" |
| Không phân buổi sáng/chiều | Chưa hỗ trợ quy tắc "lớp này chỉ học sáng" |
| Thứ tự xử lý lớp | Lớp nào trong mảng trước được ưu tiên slot tốt hơn |

---

## 5. Giao diện quản lý (Admin UI)

### 5.1 Luồng sử dụng trang Admin

```
/admin/timetable
    ├── Tab 1: Môn học
    │   ├── Xem bảng tất cả môn học
    │   ├── Thêm môn học mới (tên, mã, tiết/tuần, màu)
    │   └── Sửa / Xóa môn học
    │
    ├── Tab 2: Phân công GV
    │   ├── Xem từng GV và môn được phân công (chips màu)
    │   ├── Thêm phân công: chọn GV + chọn môn
    │   └── Xóa phân công
    │
    ├── Tab 3: Thời khoá biểu
    │   ├── Chọn lớp + năm học + học kỳ
    │   ├── Xem grid 6×10 (ngày × tiết)
    │   ├── Click ô trống → thêm tiết nhanh
    │   ├── Click ô có tiết → xóa tiết
    │   └── Nút "Tự động xếp lịch" → mở GenerateModal
    │       ├── Cấu hình: năm học, học kỳ, xóa lịch cũ?
    │       ├── Chọn lớp tham gia (có thể chọn TẤT CẢ lớp trong trường)
    │       ├── Cho mỗi lớp: thêm phân công môn học
    │       │   (môn + GV + số tiết/tuần — có thể khác với default)
    │       └── Bấm "Tạo" → hiển thị kết quả + conflicts
    │
    └── Tab 4: Yêu cầu đổi lịch
        ├── Bảng tất cả yêu cầu với filter trạng thái
        └── Admin có thể duyệt/từ chối thay GV
```

### 5.2 Luồng xếp lịch cho TOÀN TRƯỜNG

```
Bước 1. Tạo tất cả môn học của trường (Tab Môn học)
        Ví dụ: Toán (4t), Văn (3t), Anh (3t), Lý (2t), Hoá (2t), ...

Bước 2. Phân công GV (Tab Phân công GV)
        GV Nguyễn → dạy Toán
        GV Trần   → dạy Văn
        GV Lê     → dạy Anh
        ...

Bước 3. Mở "Tự động xếp lịch" (Tab Thời khoá biểu)
        ┌─────────────────────────────────────────┐
        │ Năm học: 2024-2025  │  Học kỳ: 1        │
        │ [x] Xóa lịch cũ                         │
        │                                         │
        │ [x] Lớp 10A  ──────────────── [Thu gọn] │
        │   Toán     | GV Nguyễn | 4 tiết         │
        │   Văn      | GV Trần   | 3 tiết         │
        │   [+ Thêm môn]                          │
        │                                         │
        │ [x] Lớp 10B  ──────────────── [Thu gọn] │
        │   Toán     | GV Nguyễn | 4 tiết         │
        │   Anh      | GV Lê     | 3 tiết         │
        │   [+ Thêm môn]                          │
        │                                         │
        │ [ ] Lớp 11A  (chưa chọn)                │
        │ [ ] Lớp 11B  (chưa chọn)                │
        │                                         │
        │          [Tạo thời khoá biểu]           │
        └─────────────────────────────────────────┘

Bước 4. Xem kết quả
        ✓ Đã tạo 42 tiết học
        ⚠ 1 xung đột:
          "Không đủ slot cho Thể dục ở 10B (cần 2, tìm được 1)"

Bước 5. Chỉnh sửa thủ công các tiết bị conflict
        (Tab Thời khoá biểu → chọn lớp → click ô trống → thêm tiết)
```

---

## 6. Giao diện Giáo viên & Học sinh

### 6.1 Giáo viên — Trang "Lịch dạy" (`/schedule`)

```
┌──────────────────────────────────────────────────────────────────┐
│  Lịch dạy          [Năm: 2024-2025 ▼]  [Học kỳ: 1 ▼]          │
├───────┬──────────┬──────────┬──────────┬──────────┬──────────┐   │
│ Tiết  │ Thứ Hai  │ Thứ Ba   │ Thứ Tư   │ Thứ Năm  │ Thứ Sáu  │   │
│       │ (hôm nay)│          │          │          │          │   │
├───────┼──────────┼──────────┼──────────┼──────────┼──────────┤   │
│ 1     │ Toán     │          │ Toán     │          │ Toán     │   │
│ 7:00  │ 10A  [↔] │          │ 10B  [↔] │          │ 10C  [↔] │   │
├───────┼──────────┼──────────┼──────────┼──────────┼──────────┤   │
│ 2     │          │ Toán     │          │ Toán     │          │   │
│ 7:50  │          │ 10A  [↔] │          │ 10C  [↔] │          │   │
└───────┴──────────┴──────────┴──────────┴──────────┴──────────┘   │
                                                                    │
│ [↔] = nút "Yêu cầu đổi lịch" — hiện ra khi hover                │
│                                                                   │
│ ─── Yêu cầu đổi lịch của tôi ──────────────────────────────── │
│ Toán 10A, T2 Tiết 1 → GV Phạm  [Chờ duyệt]  [Hủy]             │
└──────────────────────────────────────────────────────────────────┘
```

**Khi bấm [↔]:** Mở modal điền thông tin đổi lịch:
- ID giáo viên muốn đổi với
- ID tiết muốn đổi cụ thể (không bắt buộc)
- Lý do

**Khi GV kia nhận được yêu cầu:** Họ thấy trong panel "Yêu cầu đổi lịch" → có thể [Duyệt] hoặc [Từ chối].

**Khi duyệt:** Hai tiết học tự động hoán đổi `teacher_id` trong database.

### 6.2 Học sinh — Trang "Thời khoá biểu" (`/schedule`)

Grid giống GV nhưng:
- Hiển thị tên môn + tên GV + tên lớp
- Không có nút đổi lịch
- Chỉ đọc hoàn toàn

---

## 7. Hướng dẫn triển khai và khởi động

### 7.1 Thứ tự thực hiện cho trường học mới

1. **Tạo tài khoản Admin** (đã có sẵn qua `AdminBootstrap`)
2. **Tạo các lớp học** (qua trang chủ — tính năng hiện có)
3. **Tạo tài khoản GV** với `userType = TEACHER`, thêm vào từng lớp
4. **Vào `/admin/timetable`:**
   - Tab Môn học → thêm tất cả môn
   - Tab Phân công GV → gán GV cho từng môn
   - Tab Thời khoá biểu → Tự động xếp lịch → chọn tất cả lớp → cấu hình → tạo
5. **Kiểm tra và chỉnh sửa** các tiết bị conflict (nếu có)
6. Học sinh và GV đăng nhập và xem lịch

### 7.2 Xếp lịch học kỳ mới

1. Vào Tab Thời khoá biểu → "Tự động xếp lịch"
2. Chọn năm học mới / học kỳ mới
3. Bật "Xóa lịch cũ" nếu muốn bắt đầu từ đầu (hoặc tắt để cộng thêm vào)
4. Cấu hình lại nếu có thay đổi GV/môn
5. Tạo

---

## 8. Hạn chế và hướng phát triển tiếp theo

### 8.1 Giới hạn hiện tại
- Thuật toán Greedy có thể tạo conflict không cần thiết trong trường hợp phức tạp
- Chưa hỗ trợ: phòng học, ca học, slot không khả dụng của GV, ngày nghỉ lễ
- UI đổi lịch yêu cầu nhập UUID thủ công (nên có dropdown chọn GV và tiết)

### 8.2 Cải tiến có thể làm tiếp
- **Backtracking CSP:** Giải thuật đầy đủ hơn, đảm bảo tìm được lời giải tối ưu nếu tồn tại
- **Quản lý phòng học:** Thêm bảng `rooms`, đảm bảo mỗi phòng chỉ dùng cho 1 lớp/tiết
- **Slot không khả dụng của GV:** GV đăng ký "không thể dạy T2 buổi sáng"
- **Kéo thả trên grid:** Drag & drop tiết học để chỉnh thủ công
- **Xuất Excel/PDF:** In thời khoá biểu ra file
- **Thông báo:** Khi TKB thay đổi, tự động thông báo tới học sinh và GV liên quan
