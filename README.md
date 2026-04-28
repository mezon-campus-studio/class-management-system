# ClassroomHub

Ứng dụng quản lý lớp học toàn diện — điểm danh tự động theo thời khoá biểu, phân tổ, thi đua, trực nhật, quỹ lớp, sự kiện, tài liệu, sơ đồ chỗ ngồi, đánh giá học sinh, chat thời gian thực và thông báo.

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Backend | Spring Boot 4.0.5, Java 21, Spring Security 6 |
| Database | PostgreSQL 16+ |
| Migration | Flyway 10 (single consolidated schema `V1__init_schema.sql`) |
| Auth | JWT access token (15 phút) + Opaque refresh token (30 ngày, single-use, family-based abuse detection) |
| Realtime | WebSocket STOMP (Spring WebSocket + SockJS fallback) |
| API Docs | SpringDoc OpenAPI 3 (Swagger UI tại `/swagger-ui.html`) |
| Metrics | Spring Boot Actuator + Micrometer + Prometheus |
| Logging | Logback + Logstash JSON encoder |
| Monitoring | Grafana + Prometheus + Loki + Promtail (Docker Compose profile) |
| Frontend | React 19, TypeScript 5, Vite 8, TailwindCSS 3, Zustand, Axios, React Router 7 |

---

## Yêu cầu hệ thống

- **Java 21+** — [Temurin](https://adoptium.net/)
- **PostgreSQL 16+**
- **Node.js 20+**
- **Docker + Docker Compose** _(tùy chọn, dùng cho PostgreSQL local và monitoring stack)_

---

## Chạy local nhanh

```bash
# 1. Copy file env
cp .env.example .env

# 2. Khởi động PostgreSQL bằng Docker
docker compose up -d postgres

# 3. Cấu hình và chạy backend
cd backend
cp .env.example .env        # chỉnh DB_URL, JWT_SECRET nếu cần
./gradlew bootRun

# 4. Chạy frontend
cd ../frontend
npm install && npm run dev
```

| Service | URL |
|---|---|
| Backend API | `http://localhost:8080` |
| Frontend | `http://localhost:5173` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |

---

## Backend

### 1. Chuẩn bị database

**Cách 1 — Docker (khuyến nghị):**

```bash
cp .env.example .env
docker compose up -d postgres
```

**Cách 2 — PostgreSQL local:**

```sql
CREATE DATABASE classroomhub;
CREATE USER classroomhub_user WITH PASSWORD 'classroomhub_pass';
GRANT ALL PRIVILEGES ON DATABASE classroomhub TO classroomhub_user;
```

### 2. Cấu hình môi trường

```bash
cd backend
cp .env.example .env
```

Các biến quan trọng trong `.env`:

```env
DB_URL=jdbc:postgresql://localhost:5432/classroomhub
DB_USERNAME=classroomhub_user
DB_PASSWORD=your_password
JWT_SECRET=<chuỗi random tối thiểu 64 ký tự base64>
PORT=8080
UPLOAD_DIR=uploads
CORS_ORIGINS=http://localhost:5173
```

Tạo `JWT_SECRET`:

```bash
openssl rand -base64 64
```

### 3. Chạy backend

```bash
cd backend
chmod +x gradlew
./gradlew bootRun
```

> **Database migration:** Flyway tự động chạy `V1__init_schema.sql` khi app khởi động lần đầu. Không cần tạo bảng thủ công.

### 4. Build production JAR

```bash
./gradlew clean bootJar
# Profile local (console log):
java -jar build/libs/classroomhub-0.0.1-SNAPSHOT.jar
# Profile prod (JSON log ra file):
java -Dspring.profiles.active=prod -jar build/libs/classroomhub-0.0.1-SNAPSHOT.jar
```

---

## Frontend

### 1. Cài dependencies

```bash
cd frontend
npm install
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env.local
```

Mặc định:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080/ws
```

### 3. Chạy dev server

```bash
npm run dev   # http://localhost:5173
```

### 4. Build production

```bash
npm run build
npm run preview
```

---

## Swagger UI

Tài liệu API tương tác — có thể test trực tiếp trên browser.

```
http://localhost:8080/swagger-ui.html
```

Để gọi các endpoint cần auth:
1. Gọi `POST /api/v1/auth/login` → copy `accessToken`
2. Nhấn **Authorize** (góc trên phải) → nhập `Bearer <accessToken>`

---

## Monitoring Stack

```bash
docker compose --profile monitoring up -d
```

| Service | URL | Thông tin |
|---|---|---|
| **Grafana** | `http://localhost:3001` | admin / admin |
| **Prometheus** | `http://localhost:9090` | — |
| **Loki** | `http://localhost:3100` | — |

- **Metrics:** `http://localhost:8080/actuator/prometheus`
- **Logs:** Grafana → Explore → datasource Loki → filter `{app="classroomhub"}`
- **Profile `local`** (default): console + màu + debug SQL
- **Profile `prod`**: JSON ra `backend/logs/classroomhub.log` → Promtail → Loki

---

## Database Migrations

Flyway quản lý schema trong `backend/src/main/resources/db/migration/`.

Hiện tại chỉ có **một file consolidated**:

| File | Nội dung |
|---|---|
| `V1__init_schema.sql` | Toàn bộ schema: users, classrooms, groups, attendance, emulation, duty, documents, funds, events, chat, notifications, seating, timetable, evaluations, parent_links |

> **Quy tắc:** Không bao giờ sửa file migration đã commit. Thêm thay đổi schema bằng file `V2__...sql` mới.

---

## Cấu trúc thư mục

```
class-management-system/
├── backend/
│   ├── src/main/java/com/classroomhub/
│   │   ├── ClassroomHubApplication.java
│   │   ├── config/                        # JPA, OpenAPI, Security, WebSocket, Async
│   │   ├── common/
│   │   │   ├── exception/                 # ErrorCode, BusinessException, GlobalExceptionHandler
│   │   │   ├── response/                  # ApiResponse<T>
│   │   │   └── security/                  # JwtService, JwtAuthFilter, SecurityUtils, StompAuthInterceptor
│   │   └── domain/
│   │       ├── auth/                      # User, RefreshToken, PasswordResetToken, JWT rotation
│   │       ├── classroom/                 # Classroom, ClassroomMember, invite codes
│   │       ├── group/                     # Group (color, leaderId), GroupMember
│   │       ├── attendance/                # AttendanceSession (SCHEDULED/OPEN/CLOSED), AttendanceRecord
│   │       ├── emulation/                 # EmulationCategory, EmulationEntry, leaderboard
│   │       ├── duty/                      # DutyType, DutyAssignment, confirmation workflow
│   │       ├── document/                  # Folder, Document, file upload (max 20MB)
│   │       ├── fund/                      # Fund, FundCollection, FundPayment, FundExpense + VNPay/MoMo
│   │       ├── event/                     # Event, EventRsvp, AbsenceRequest, Poll, PollVote
│   │       ├── chat/                      # Conversation, Message, MessageReaction, pin
│   │       ├── notification/              # Notification, NotificationPreference
│   │       ├── seating/                   # SeatingChart
│   │       ├── timetable/                 # Subject, TimetableEntry, SwapRequest, ClassroomSubjectConfig
│   │       ├── evaluation/                # StudentEvaluation
│   │       ├── parent/                    # ParentLink (parent-child relationship)
│   │       └── admin/                     # Metrics, user management, classroom archive
│   └── src/main/resources/
│       ├── application.properties
│       ├── logback-spring.xml
│       └── db/migration/V1__init_schema.sql
├── frontend/
│   └── src/
│       ├── app/                           # Router, AppProviders, authStore, classroomStore (Zustand)
│       ├── features/
│       │   ├── auth/                      # LoginPage, RegisterPage, ForgotPasswordPage
│       │   ├── classroom/                 # ClassroomDetailPage, member management
│       │   ├── attendance/                # AttendancePage, AttendanceSessionPage (SCHEDULED/OPEN/CLOSED)
│       │   ├── chat/                      # ChatPage — STOMP WebSocket, reactions, pin, attachments
│       │   ├── classDiagram/              # Sơ đồ chỗ ngồi (visual seat chart)
│       │   ├── document/                  # FileBrowserPage, upload interface
│       │   ├── duty/                      # DutyPage — assignments, confirmation
│       │   ├── emulation/                 # EmulationPage — scoreboard, categories
│       │   ├── evaluation/                # EvaluationPage — student evaluations
│       │   ├── event/                     # EventPage, RSVP, absence requests, polls
│       │   ├── fund/                      # FundPage — collections, payments, expenses
│       │   ├── notification/              # NotificationPage — inbox, unread badge
│       │   ├── parent/                    # ParentPortal — link children, view evaluations
│       │   ├── schedule/                  # SchedulePage — timetable view (teacher/student)
│       │   ├── seating/                   # SeatingPage — seat arrangement
│       │   ├── user/                      # ProfilePage
│       │   ├── home/                      # HomePage — classroom list
│       │   └── admin/                     # AdminDashboard — metrics, user management
│       ├── services/                      # api-client.ts (Axios + JWT interceptors, refresh rotation)
│       └── shared/                        # PrivateRoute, Modal, Badge, Spinner, Sidebar, Topbar
├── docker/
│   └── monitoring/                        # prometheus.yml, loki-config.yml, promtail-config.yml, grafana/
├── docs/
│   ├── ClassroomHub_DetailDesign.md       # Tài liệu thiết kế chi tiết hệ thống
│   ├── TIMETABLE_SCHEDULING.md            # Tài liệu kỹ thuật tính năng thời khoá biểu
│   ├── USER_GUIDE.md                      # Hướng dẫn sử dụng cho người dùng cuối
│   └── ATTENDANCE_FLOW.md                 # Flow điểm danh tự động chi tiết
├── docker-compose.yml
├── .env.example
├── CONVENTION.md
└── README.md
```

---

## API Overview

### Auth (`/api/v1/auth`)

| Method | Path | Mô tả |
|---|---|---|
| POST | `/register` | Đăng ký tài khoản |
| POST | `/login` | Đăng nhập (trả JWT + refresh token) |
| POST | `/refresh` | Làm mới access token (token rotation) |
| POST | `/logout` | Thu hồi refresh token hiện tại |
| DELETE | `/sessions` | Thu hồi tất cả phiên đăng nhập |
| GET | `/me` | Thông tin user hiện tại |
| PUT | `/me` | Cập nhật profile (displayName, avatarUrl) |
| POST | `/forgot-password` | Khởi tạo reset mật khẩu (gửi email) |
| POST | `/reset-password` | Hoàn tất reset mật khẩu |

### Classroom & Group

| Method | Path | Mô tả |
|---|---|---|
| GET/POST | `/api/v1/classrooms` | Danh sách / Tạo lớp |
| GET/PATCH | `/api/v1/classrooms/{id}` | Chi tiết / Cập nhật lớp |
| POST | `/api/v1/classrooms/join` | Tham gia bằng mã mời |
| POST | `/api/v1/classrooms/{id}/invite-code/regenerate` | Tái tạo mã mời |
| DELETE | `/api/v1/classrooms/{id}/leave` | Rời lớp |
| GET/PATCH/DELETE | `/api/v1/classrooms/{id}/members/{memberId}` | Quản lý thành viên |
| GET/POST | `/api/v1/classrooms/{id}/groups` | Danh sách / Tạo tổ |
| POST/DELETE | `/api/v1/classrooms/{id}/groups/{gid}/members` | Thêm / Xóa thành viên tổ |

### Điểm danh

| Method | Path | Mô tả |
|---|---|---|
| GET/POST | `/api/v1/classrooms/{id}/attendance/sessions` | Danh sách / Tạo phiên thủ công |
| GET | `/api/v1/classrooms/{id}/attendance/daily` | Tổng hợp điểm danh hôm nay |
| POST | `/api/v1/classrooms/{id}/attendance/sessions/{sid}/check-in` | Tự điểm danh (học sinh) |
| GET | `/api/v1/classrooms/{id}/attendance/sessions/{sid}` | Chi tiết phiên |
| POST | `/api/v1/classrooms/{id}/attendance/sessions/{sid}/close` | Đóng phiên thủ công |
| DELETE | `/api/v1/classrooms/{id}/attendance/sessions/{sid}` | Xóa phiên |
| GET | `/api/v1/classrooms/{id}/attendance/sessions/{sid}/records` | Danh sách bản ghi |
| PATCH | `/api/v1/classrooms/{id}/attendance/sessions/{sid}/records/{rid}` | Duyệt / sửa bản ghi |

### Thời khoá biểu

| Method | Path | Mô tả |
|---|---|---|
| GET/POST | `/api/v1/timetable/subjects` | Danh sách / Tạo môn học |
| PUT/DELETE | `/api/v1/timetable/subjects/{id}` | Cập nhật / Xóa môn học |
| GET/POST | `/api/v1/timetable/teacher-subjects` | Phân công giáo viên — môn |
| GET/POST | `/api/v1/timetable/entries` | Danh sách / Tạo tiết học |
| PUT/DELETE | `/api/v1/timetable/entries/{id}` | Cập nhật / Xóa tiết học |
| POST | `/api/v1/timetable/entries/generate` | Tự động xếp lịch từ subjects |
| POST | `/api/v1/timetable/entries/generate-from-config` | Tự động xếp lịch từ config |
| GET/POST | `/api/v1/timetable/configs` | Cấu hình xếp lịch |
| GET | `/api/v1/timetable/me` | Thời khoá biểu của tôi (giáo viên) |
| GET/POST | `/api/v1/timetable/swaps` | Danh sách / Yêu cầu đổi tiết |
| POST | `/api/v1/timetable/swaps/{id}/approve` | Duyệt đổi tiết |
| POST | `/api/v1/timetable/swaps/{id}/reject` | Từ chối đổi tiết |

### Thi đua

| Method | Path | Mô tả |
|---|---|---|
| GET/POST | `/api/v1/classrooms/{id}/emulation/categories` | Hạng mục thi đua |
| PUT/DELETE | `/api/v1/classrooms/{id}/emulation/categories/{cid}` | Cập nhật / Xóa hạng mục |
| GET/POST | `/api/v1/classrooms/{id}/emulation/entries` | Ghi điểm |
| PUT/DELETE | `/api/v1/classrooms/{id}/emulation/entries/{eid}` | Sửa / Xóa điểm |
| GET | `/api/v1/classrooms/{id}/emulation/summary` | Tổng điểm từng thành viên |

### Trực nhật

| Method | Path | Mô tả |
|---|---|---|
| GET/POST | `/api/v1/classrooms/{id}/duty/types` | Loại trực nhật |
| PUT/DELETE | `/api/v1/classrooms/{id}/duty/types/{tid}` | Cập nhật / Xóa loại |
| GET/POST | `/api/v1/classrooms/{id}/duty/assignments` | Phân công (lọc theo `?date=`) |
| GET | `/api/v1/classrooms/{id}/duty/assignments/me` | Trực nhật của tôi |
| POST | `/api/v1/classrooms/{id}/duty/assignments/{aid}/confirm` | Xác nhận hoàn thành |

### Tài liệu

| Method | Path | Mô tả |
|---|---|---|
| GET/POST | `/api/v1/classrooms/{id}/documents/folders` | Thư mục gốc |
| GET/DELETE | `/api/v1/classrooms/{id}/documents/folders/{fid}` | Nội dung / Xóa thư mục |
| POST | `/api/v1/classrooms/{id}/documents/upload` | Upload file (multipart, `?folderId=`, max 20MB) |
| GET | `/api/v1/classrooms/{id}/documents` | Danh sách tài liệu (`?folderId=`) |
| DELETE | `/api/v1/classrooms/{id}/documents/{did}` | Xóa tài liệu |
| GET | `/api/v1/classrooms/{id}/documents/{did}/content` | Download file |

### Quỹ lớp

| Method | Path | Mô tả |
|---|---|---|
| GET/POST | `/api/v1/classrooms/{id}/fund` | Thông tin / Tạo quỹ |
| PATCH | `/api/v1/classrooms/{id}/fund/bank-info` | Cập nhật thông tin ngân hàng |
| GET | `/api/v1/classrooms/{id}/fund/summary` | Tổng kết thu-chi-tồn |
| GET | `/api/v1/classrooms/{id}/fund/capabilities` | Cổng thanh toán khả dụng |
| GET/POST | `/api/v1/classrooms/{id}/fund/collections` | Đợt thu / Tạo đợt thu |
| GET/POST | `/api/v1/classrooms/{id}/fund/payments` | Danh sách / Ghi nhận thanh toán |
| POST | `/api/v1/classrooms/{id}/fund/payments/initiate` | Khởi tạo thanh toán online (VNPay/MoMo) |
| POST | `/api/v1/classrooms/{id}/fund/payments/{pid}/confirm` | Xác nhận đã thu |
| POST | `/api/v1/classrooms/{id}/fund/payments/{pid}/revert` | Hoàn trả thanh toán |
| GET | `/api/v1/classrooms/{id}/fund/payments/me` | Thanh toán của tôi |
| GET/POST | `/api/v1/classrooms/{id}/fund/expenses` | Khoản chi |

### Sự kiện & Bình chọn

| Method | Path | Mô tả |
|---|---|---|
| GET/POST | `/api/v1/classrooms/{id}/events` | Danh sách / Tạo sự kiện |
| PUT/DELETE | `/api/v1/classrooms/{id}/events/{eid}` | Cập nhật / Xóa sự kiện |
| POST | `/api/v1/classrooms/{id}/events/{eid}/rsvp` | Phản hồi tham dự |
| GET | `/api/v1/classrooms/{id}/events/{eid}/rsvps` | Danh sách RSVP |
| GET/POST | `/api/v1/classrooms/{id}/events/absence-requests` | Đơn xin vắng |
| PUT | `/api/v1/classrooms/{id}/events/absence-requests/{rid}/review` | Duyệt / Từ chối đơn |
| GET/POST | `/api/v1/classrooms/{id}/events/polls` | Danh sách / Tạo bình chọn |
| POST | `/api/v1/classrooms/{id}/events/polls/{pid}/vote` | Bỏ phiếu |
| PUT/DELETE | `/api/v1/classrooms/{id}/events/polls/{pid}` | Cập nhật / Xóa bình chọn |

### Chat (REST + WebSocket)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/v1/classrooms/{id}/chat/conversations` | Danh sách hội thoại |
| GET | `/api/v1/classrooms/{id}/chat/conversations/class` | Hội thoại chung lớp |
| GET | `/api/v1/classrooms/{id}/chat/conversations/{cid}/messages` | Lịch sử tin nhắn (phân trang) |
| POST | `/api/v1/classrooms/{id}/chat/conversations/{cid}/messages` | Gửi tin nhắn |
| DELETE | `/api/v1/classrooms/{id}/chat/conversations/{cid}/messages/{mid}` | Xóa tin nhắn |
| POST | `/api/v1/classrooms/{id}/chat/conversations/{cid}/attachments` | Upload file đính kèm |
| GET | `/api/v1/classrooms/{id}/chat/conversations/{cid}/pinned` | Tin nhắn đã ghim |
| POST/DELETE | `/api/v1/classrooms/{id}/chat/conversations/{cid}/messages/{mid}/pin` | Ghim / Bỏ ghim |
| POST/DELETE | `/api/v1/classrooms/{id}/chat/conversations/{cid}/messages/{mid}/reactions` | Thêm / Xóa reaction |

**WebSocket STOMP:** kết nối tại `ws://localhost:8080/ws` (SockJS fallback)
- Subscribe: `/topic/conversations/{conversationId}` — nhận tin nhắn realtime

### Thông báo

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/v1/notifications` | Danh sách (phân trang) |
| GET | `/api/v1/notifications/unread-count` | Số chưa đọc |
| PATCH | `/api/v1/notifications/{id}/read` | Đánh dấu đã đọc |
| POST | `/api/v1/notifications/read-all` | Đánh dấu tất cả đã đọc |
| GET/PUT | `/api/v1/notifications/preferences` | Cài đặt thông báo |

### Sơ đồ chỗ ngồi

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/v1/classrooms/{id}/seating` | Lấy sơ đồ chỗ ngồi |
| PUT | `/api/v1/classrooms/{id}/seating` | Cập nhật sơ đồ |

### Đánh giá học sinh

| Method | Path | Mô tả |
|---|---|---|
| GET/POST | `/api/v1/classrooms/{id}/evaluations` | Danh sách / Tạo đánh giá |
| GET | `/api/v1/classrooms/{id}/evaluations/students/{studentId}` | Đánh giá của một học sinh |
| DELETE | `/api/v1/classrooms/{id}/evaluations/{eid}` | Xóa đánh giá |

### Cổng phụ huynh

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/v1/parent/children` | Danh sách con đã liên kết |
| POST | `/api/v1/parent/children` | Liên kết tài khoản con |
| DELETE | `/api/v1/parent/children/{linkId}` | Hủy liên kết |
| GET | `/api/v1/parent/classrooms` | Lớp học của con |
| GET | `/api/v1/parent/classrooms/{id}/evaluations` | Đánh giá của con |
| POST | `/api/v1/parent/classrooms/{id}/absence-requests` | Xin phép vắng học cho con |

### Admin

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/v1/admin/metrics` | Metrics hệ thống |
| GET | `/api/v1/admin/users` | Danh sách tất cả user |
| PATCH | `/api/v1/admin/users/{userId}/status` | Khoá / Mở khoá tài khoản |
| GET | `/api/v1/admin/classrooms` | Danh sách tất cả lớp |
| POST | `/api/v1/admin/classrooms/{id}/archive` | Lưu trữ lớp |

---

## Authentication

Tất cả endpoint (trừ `/auth/register`, `/auth/login`, `/auth/refresh`, Swagger UI, Actuator health) yêu cầu:

```
Authorization: Bearer <access_token>
```

### Token Rotation & Abuse Detection

- `POST /auth/refresh` → token cũ đánh dấu `USED`, token mới cùng `familyId` được cấp.
- Nếu token `USED` bị replay → **toàn bộ family bị revoke** → buộc đăng nhập lại.
- Access token TTL: **15 phút**. Refresh token TTL: **30 ngày**.

---

## Role & Quyền hạn

Thứ tự tăng dần: `MEMBER < GROUP_LEADER / TREASURER < VICE_MONITOR < MONITOR < TEACHER < OWNER`

| Hành động | Quyền tối thiểu |
|---|---|
| Xem dữ liệu lớp | MEMBER |
| Tự điểm danh | MEMBER |
| Bỏ phiếu bình chọn, RSVP sự kiện | MEMBER |
| Xác nhận trực nhật | MEMBER |
| Ghi điểm thi đua, phân công trực nhật | GROUP_LEADER |
| Quản lý quỹ, xác nhận thu tiền | TREASURER |
| Tạo sự kiện, duyệt đơn vắng | MONITOR |
| Tạo / đóng phiên điểm danh thủ công | TEACHER |
| Tạo thời khoá biểu, quản lý môn học | TEACHER |
| Upload / xóa tài liệu | TEACHER |
| Đánh giá học sinh | TEACHER |
| Quản lý toàn bộ lớp, phân quyền | OWNER |

---

## Tài liệu bổ sung

| File | Nội dung |
|---|---|
| [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) | Hướng dẫn sử dụng đầy đủ cho người dùng cuối |
| [`docs/ATTENDANCE_FLOW.md`](docs/ATTENDANCE_FLOW.md) | Flow điểm danh tự động theo thời khoá biểu |
| [`docs/TIMETABLE_SCHEDULING.md`](docs/TIMETABLE_SCHEDULING.md) | Kỹ thuật xếp thời khoá biểu tự động |
| [`docs/ClassroomHub_DetailDesign.md`](docs/ClassroomHub_DetailDesign.md) | Thiết kế chi tiết hệ thống |
| [`CONVENTION.md`](CONVENTION.md) | Quy ước code backend & frontend |
