# ClassroomHub — Detail Design Document

> **Version:** 1.1.0
> **Author:** Andy & Team
> **Created:** 2026-04-12 · **Updated:** 2026-04-28
> **Status:** In Progress
> **Tech Stack:** Java Spring Boot 4 · React 19 TypeScript · PostgreSQL 16

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Glossary & Definitions](#2-glossary--definitions)
3. [System Overview](#3-system-overview)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [System Architecture](#7-system-architecture)
8. [Database Design](#8-database-design)
9. [API Design](#9-api-design)
10. [Module Detail Design](#10-module-detail-design)
11. [Platform Feature Matrix](#11-platform-feature-matrix)
12. [UI/UX Design Guidelines](#12-uiux-design-guidelines)
13. [Security Design](#13-security-design)
14. [Integration & Third-Party Services](#14-integration--third-party-services)
15. [Deployment Architecture](#15-deployment-architecture)
16. [Testing Strategy](#16-testing-strategy)
17. [Performance & Scalability](#17-performance--scalability)
18. [Error Handling & Logging](#18-error-handling--logging)
19. [Migration & Data Strategy](#19-migration--data-strategy)
20. [Appendix](#20-appendix)

---

## 1. Introduction

### 1.1 Purpose

ClassroomHub là ứng dụng quản lý lớp học toàn diện, phục vụ giáo viên, học sinh/sinh viên và phụ huynh. Ứng dụng giải quyết triệt để các vấn đề vận hành lớp học bao gồm: quản lý sĩ số, phân tổ và thi đua, quản lý quỹ lớp, lưu trữ tài liệu, sự kiện, điểm danh, giao tiếp và kết nối phụ huynh.

### 1.2 Scope

- **Web App:** React 19 + TypeScript + Vite — ứng dụng chính dành cho học sinh, giáo viên, phụ huynh và quản trị viên. Hỗ trợ đầy đủ tất cả tính năng trên trình duyệt.
- **Backend API:** Java 21 + Spring Boot 4 — RESTful API, WebSocket STOMP, scheduled jobs.

> **Lưu ý:** Mobile app (Kotlin Multiplatform) là kế hoạch tương lai, chưa được triển khai trong phiên bản hiện tại.

### 1.3 Target Users

| User Type | Description |
|-----------|-------------|
| Học sinh / Sinh viên | Thành viên chính của lớp học |
| Giáo viên / Giảng viên | Quản lý lớp, giảng dạy |
| Tổ trưởng | Quản lý tổ, chấm thi đua |
| Lớp trưởng / Lớp phó | Hỗ trợ quản lý lớp |
| Phụ huynh | Theo dõi tình hình con em |
| System Admin | Quản trị hệ thống tổng thể |

### 1.4 Document Conventions

- `[W]` = Web App (hiện tại)
- `[M]` = Mobile App (kế hoạch tương lai)
- `[P1]` = Priority 1 (MVP — đã triển khai)
- `[P2]` = Priority 2 (Phase 2 — đang phát triển)
- `[P3]` = Priority 3 (Tương lai)

---

## 2. Glossary & Definitions

| Term | Definition |
|------|-----------|
| Classroom / Room | Một lớp học ảo, tương tự Google Classroom |
| Group / Tổ | Nhóm nhỏ trong lớp, phục vụ thi đua và phân công |
| Emulation Points (Điểm thi đua) | Hệ thống điểm đánh giá hành vi, học tập của từng thành viên |
| Class Fund (Quỹ lớp) | Quỹ tiền chung của lớp |
| Duty Roster (Trực nhật) | Lịch phân công nhiệm vụ cho từng thành viên/tổ |
| Thread | Cuộc trao đổi phụ được tạo từ một tin nhắn trong conversation chính |
| Seating Chart (Sơ đồ lớp) | Bản đồ vị trí ngồi của học sinh trong lớp |
| Parent Portal | Cổng thông tin dành cho phụ huynh |
| Attendance | Điểm danh, ghi nhận sự có mặt |

---

## 3. System Overview

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              Web App (React 19 + TypeScript)           │     │
│  │  Vite · TailwindCSS · Zustand · React Router 7        │     │
│  │  STOMP.js + SockJS (WebSocket)                        │     │
│  └───────────────────────┬────────────────────────────────┘     │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTPS / WSS
┌──────────────────────────┼──────────────────────────────────────┐
│                     BACKEND LAYER                               │
│  ┌────────────────────────────────────────────────────────┐     │
│  │          Spring Boot 4 Application (Java 21)           │     │
│  │                                                        │     │
│  │  auth · classroom · group · attendance · emulation     │     │
│  │  duty · document · fund · event · chat · notification  │     │
│  │  seating · timetable · evaluation · parent · admin     │     │
│  │                                                        │     │
│  │  Scheduled Jobs: auto-open/close attendance (5 min)   │     │
│  │                  daily session pre-generate (00:00)   │     │
│  └─────────────────────┬──────────────────────────────────┘     │
│                        │                                        │
│  ┌─────────────────────┴──────────────────────────────────┐     │
│  │               PostgreSQL 16 (HikariCP)                 │     │
│  │    Flyway migrations · UUID PKs · TIMESTAMPTZ UTC      │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                  EXTERNAL SERVICES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Gmail SMTP  │  │    VNPay     │  │    MoMo      │          │
│  │   (Email)    │  │  (Payment)   │  │  (Payment)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│               MONITORING (Docker Compose profile)               │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐                  │
│  │Prometheus│  │ Grafana 3001 │  │  Loki    │ ← Promtail       │
│  └──────────┘  └──────────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack

| Layer | Technology | Ghi chú |
|-------|-----------|---------|
| **Web Frontend** | React 19 + TypeScript 5 + Vite 8 | Ứng dụng web chính |
| **Web UI** | TailwindCSS 3 + Lucide React | Custom design system (CSS variables) |
| **State Management** | Zustand 5 | authStore, classroomStore |
| **HTTP Client** | Axios 1.15 + interceptors | JWT rotation tự động |
| **Routing** | React Router 7 | Feature-based routing |
| **WebSocket Client** | STOMP.js + SockJS | Real-time chat |
| **Backend** | Java 21 + Spring Boot 4.0.5 | RESTful API + WebSocket broker |
| **Security** | Spring Security 6 + JJWT 0.12.6 | JWT + refresh token rotation |
| **ORM** | Spring Data JPA + Hibernate | Entity mapping, repositories |
| **Database** | PostgreSQL 16 | UUID PKs, TIMESTAMPTZ, HikariCP pool |
| **Migration** | Flyway 10 | `V1__init_schema.sql` (consolidated) |
| **Mapping** | MapStruct 1.6.3 | DTO ↔ Entity mapping |
| **API Docs** | SpringDoc OpenAPI 2.8.8 | Swagger UI tại `/swagger-ui.html` |
| **Metrics** | Micrometer + Prometheus | `/actuator/prometheus` |
| **Logging** | Logback + Logstash encoder | JSON logs → Loki (prod profile) |
| **Real-time** | WebSocket STOMP over SockJS | Chat, broadcast |
| **Email** | Spring Mail + Gmail SMTP | Password reset, notifications |
| **Payment** | VNPay + MoMo (sandbox → prod) | Cổng thanh toán Việt Nam |
| **File Storage** | Local filesystem (`UPLOAD_DIR`) | Max 20MB/file, phục vụ qua REST |
| **Monitoring** | Prometheus + Grafana + Loki + Promtail | Docker Compose `--profile monitoring` |
| **Build** | Gradle (Kotlin DSL) | Backend; npm/Vite cho Frontend |

---

## 4. User Roles & Permissions

### 4.1 Role Hierarchy

```
System Admin
  └── Classroom Owner (Creator)
        ├── Teacher (Co-Admin)
        │     └── có tất cả quyền trừ xóa classroom & transfer
        ├── Class Monitor (Lớp trưởng)
        │     └── quản lý sự kiện, quỹ, điểm danh, thi đua tổng
        ├── Vice Monitor (Lớp phó)
        │     └── hỗ trợ lớp trưởng, quản lý tài liệu chung
        ├── Group Leader (Tổ trưởng)
        │     └── quản lý thi đua tổ, phân công trực nhật
        ├── Treasurer (Thủ quỹ)
        │     └── quản lý thu chi quỹ lớp
        ├── Member (Thành viên)
        │     └── quyền cơ bản: xem, chat, upload cá nhân
        └── Parent (Phụ huynh) [linked to Member]
              └── read-only: xem báo cáo, xin phép nghỉ
```

### 4.2 Permission Matrix

| Permission | Owner | Teacher | Monitor | Vice Mon. | Group Lead | Treasurer | Member | Parent |
|-----------|:-----:|:-------:|:-------:|:---------:|:----------:|:---------:|:------:|:------:|
| Tạo/Xóa Classroom | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Transfer Classroom | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Mời/Xóa thành viên | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gán role thành viên | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tạo/Sửa tổ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Chấm thi đua tổ mình | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Tổng kết thi đua tất cả | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Phân công trực nhật | ✅ | ✅ | ✅ | ✅ | ✅ (tổ mình) | ❌ | ❌ | ❌ |
| Quản lý quỹ (thu/chi) | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Xem báo cáo quỹ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tạo sự kiện | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve nghỉ phép | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Điểm danh | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Upload folder chung | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Upload folder cá nhân | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Chia sẻ file cá nhân | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Chat & tạo thread | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Xem sơ đồ lớp | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Gửi báo cáo phụ huynh | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Xem báo cáo (PH) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Xin phép nghỉ (PH) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 5. Functional Requirements

### 5.1 Module: Authentication & User Management `[P1][MW]`

**FR-AUTH-01:** Đăng ký tài khoản bằng email/số điện thoại + mật khẩu.
**FR-AUTH-02:** Đăng nhập bằng email/SĐT + mật khẩu, hoặc OAuth2 (Google, Apple Sign-In).
**FR-AUTH-03:** Forgot password qua email OTP hoặc SMS OTP.
**FR-AUTH-04:** JWT-based authentication với access token (15 phút) + refresh token (30 ngày).
**FR-AUTH-05:** Quản lý profile cá nhân: avatar, tên hiển thị, SĐT, email, ngày sinh.
**FR-AUTH-06:** Liên kết tài khoản phụ huynh với học sinh thông qua mã mời (invite code).
**FR-AUTH-07:** Đăng xuất và revoke tất cả session trên các thiết bị.

### 5.2 Module: Classroom Management `[P1][MW]`

**FR-CLASS-01:** Tạo Classroom mới với thông tin: tên lớp, mô tả, năm học, hệ (THPT/ĐH/...), ảnh đại diện.
**FR-CLASS-02:** Tạo mã mời (invite code) 6 ký tự, có thời hạn, có thể regenerate.
**FR-CLASS-03:** Tạo link mời (invite link) có thể chia sẻ qua QR code.
**FR-CLASS-04:** Admin thêm thành viên bằng email/SĐT hoặc tìm kiếm username.
**FR-CLASS-05:** Admin xóa thành viên khỏi Classroom (soft delete, giữ lại lịch sử).
**FR-CLASS-06:** Admin transfer quyền Owner cho thành viên khác.
**FR-CLASS-07:** Admin xóa (archive) Classroom — dữ liệu giữ lại 90 ngày.
**FR-CLASS-08:** Hiển thị danh sách thành viên với role, avatar, trạng thái online/offline.
**FR-CLASS-09:** Mỗi user có thể tham gia tối đa 20 Classrooms đồng thời.
**FR-CLASS-10:** Classroom settings: bật/tắt modules (Fund, Events, Emulation...).

### 5.3 Module: Seating Chart & Class Size `[P1][M][P2-W]`

**FR-SEAT-01:** Hiển thị sơ đồ lớp dạng grid (hàng x cột), mỗi ô là một vị trí ngồi.
**FR-SEAT-02:** Admin/Teacher kéo-thả (drag & drop) để sắp xếp vị trí ngồi cho từng học sinh.
**FR-SEAT-03:** Hiển thị sĩ số realtime trên màn hình chính: tổng số / có mặt / vắng / xin phép.
**FR-SEAT-04:** Tap vào avatar trên sơ đồ để xem quick profile: tên, tổ, điểm thi đua tuần, trạng thái điểm danh hôm nay.
**FR-SEAT-05:** Color coding trên sơ đồ: xanh (có mặt), đỏ (vắng không phép), vàng (xin phép), xám (chưa điểm danh).
**FR-SEAT-06:** Lưu nhiều layout sơ đồ (ví dụ: sơ đồ học kỳ 1, sơ đồ thi).
**FR-SEAT-07:** Export sơ đồ lớp dạng ảnh PNG/PDF.

### 5.4 Module: Group & Emulation Management `[P1][MW]`

#### 5.4.1 Group Management

**FR-GROUP-01:** Admin/Teacher tạo tổ (Group) với tên tổ, màu đại diện, chọn tổ trưởng.
**FR-GROUP-02:** Phân thành viên vào tổ — mỗi thành viên thuộc đúng 1 tổ.
**FR-GROUP-03:** Hỗ trợ shuffle ngẫu nhiên thành viên vào các tổ.
**FR-GROUP-04:** Thay đổi tổ trưởng bất kỳ lúc nào.

#### 5.4.2 Emulation Points (Điểm thi đua)

**FR-EMU-01:** Tổ trưởng/Admin nhập điểm thi đua cho từng thành viên trong tổ.
**FR-EMU-02:** Mỗi entry điểm gồm: loại (cộng/trừ), số điểm, lý do, ngày, người chấm.
**FR-EMU-03:** Danh mục lý do có sẵn (configurable): đi trễ (-1đ), phát biểu (+1đ), vi phạm đồng phục (-2đ), hoàn thành bài tập (+1đ)... Admin có thể tùy chỉnh danh mục.
**FR-EMU-04:** Tổng kết thi đua theo tuần: tự động generate vào cuối mỗi tuần (chủ nhật 23:59) hoặc Admin trigger thủ công.
**FR-EMU-05:** Tổng kết thi đua theo tháng, học kỳ, năm học.
**FR-EMU-06:** Bảng xếp hạng (Leaderboard) cá nhân và tổ — realtime update.
**FR-EMU-07:** Biểu đồ thi đua: bar chart so sánh tổ, line chart xu hướng theo thời gian, pie chart phân bố lý do cộng/trừ.
**FR-EMU-08:** Drill-down: Tổng thể → Chọn tổ → Xem từng thành viên → Xem chi tiết từng entry.
**FR-EMU-09:** Export báo cáo thi đua dạng PDF/Excel.
**FR-EMU-10:** Notification khi bị trừ điểm (cho thành viên và phụ huynh nếu linked).

#### 5.4.3 Duty Roster (Trực nhật & Phân công)

**FR-DUTY-01:** Tạo loại nhiệm vụ: trực nhật, vệ sinh, chuẩn bị bảng, tưới cây...
**FR-DUTY-02:** Phân công nhiệm vụ theo ngày/tuần cho từng thành viên hoặc tổ.
**FR-DUTY-03:** Lịch trực nhật tự động xoay vòng (round-robin) theo tổ hoặc cá nhân.
**FR-DUTY-04:** Đánh dấu hoàn thành/chưa hoàn thành nhiệm vụ.
**FR-DUTY-05:** Tích hợp với điểm thi đua: hoàn thành trực nhật +1đ, quên trực nhật -1đ (configurable).
**FR-DUTY-06:** Notification nhắc nhở trực nhật buổi sáng (configurable time).

### 5.5 Module: Document Storage `[P1][MW]`

**FR-DOC-01:** Mỗi Classroom có **Shared Folder** (thư mục chung) — các thành viên có quyền upload tài liệu đề cương, bài giảng.
**FR-DOC-02:** Mỗi thành viên có **Personal Folder** (thư mục cá nhân) — chỉ chính mình truy cập.
**FR-DOC-03:** Thành viên có thể chia sẻ file từ Personal Folder cho: Teacher, tổ trưởng, toàn lớp, hoặc cá nhân cụ thể thông qua share link với permission (view/download).
**FR-DOC-04:** Hỗ trợ upload: PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, ảnh (JPG/PNG), video (MP4, tối đa 500MB).
**FR-DOC-05:** Tổ chức folder/subfolder trong cả Shared và Personal.
**FR-DOC-06:** Preview file online (PDF, ảnh, Office files qua LibreOffice conversion).
**FR-DOC-07:** Tìm kiếm file theo tên, tag, người upload, ngày upload.
**FR-DOC-08:** Giới hạn storage: Personal 500MB/người, Shared 5GB/Classroom (configurable).
**FR-DOC-09:** Versioning file: giữ 5 phiên bản gần nhất khi upload lại cùng tên.
**FR-DOC-10:** Teacher có thể tạo **Assignment Folder** — nơi học sinh submit bài tập, chỉ Teacher thấy bài của tất cả, học sinh chỉ thấy bài mình.

### 5.6 Module: Class Fund Management `[P1][MW]`

**FR-FUND-01:** Tạo đợt thu quỹ mới: tên đợt, số tiền/người, hạn nộp, mô tả.
**FR-FUND-02:** Dashboard quỹ: tổng quỹ hiện tại, đã thu, chưa thu, đã chi, còn lại.
**FR-FUND-03:** Danh sách thu: checkbox ai đã nộp/chưa nộp, số tiền nộp, ngày nộp.
**FR-FUND-04:** Ghi nhận chi tiêu: số tiền, lý do, ngày chi, ảnh chứng từ (receipt photo).
**FR-FUND-05:** Tích hợp VietQR: sinh mã QR thanh toán cho từng đợt thu, gồm nội dung chuyển khoản chuẩn.
**FR-FUND-06:** Tích hợp SePay/VNPay webhook: tự động xác nhận đã nộp khi nhận được chuyển khoản (realtime via WebSocket).
**FR-FUND-07:** Notification nhắc nhở nộp quỹ trước hạn 3 ngày, 1 ngày, quá hạn.
**FR-FUND-08:** Báo cáo thu chi theo tháng, học kỳ — biểu đồ cột (thu vào vs chi ra).
**FR-FUND-09:** Export sao kê quỹ dạng PDF/Excel.
**FR-FUND-10:** Audit log: mọi thay đổi (sửa, xóa entry) đều được ghi log với timestamp và người thực hiện, không thể xóa log.
**FR-FUND-11:** Tính năng **Transparent Mode**: cho phép tất cả thành viên xem realtime sao kê thu chi (có thể bật/tắt bởi Admin).
**FR-FUND-12:** Hỗ trợ nhiều khoản quỹ song song (quỹ lớp, quỹ hoạt động, quỹ từ thiện...).

### 5.7 Module: Events & Activities `[P1][MW]`

**FR-EVT-01:** Tạo sự kiện với: tên, mô tả, thời gian bắt đầu/kết thúc, địa điểm, loại (bắt buộc/không bắt buộc), ảnh bìa.
**FR-EVT-02:** Hiển thị sự kiện trên Calendar view và List view.
**FR-EVT-03:** Thành viên RSVP: Tham gia / Không tham gia / Có thể tham gia.
**FR-EVT-04:** Sự kiện bắt buộc: nếu không tham gia phải gửi Absence Request kèm lý do → Admin approve/reject.
**FR-EVT-05:** Dashboard sự kiện: danh sách người tham gia, chưa phản hồi, xin phép.
**FR-EVT-06:** Tạo Poll/Vote trong sự kiện hoặc độc lập: single choice, multiple choice, ranking.
**FR-EVT-07:** Poll có thời hạn, kết quả realtime (bar chart), ẩn/hiện kết quả trước khi hết hạn.
**FR-EVT-08:** Reminder notification trước sự kiện 1 ngày, 1 giờ (configurable).
**FR-EVT-09:** Recurring events: lặp lại hàng tuần, hàng tháng.
**FR-EVT-10:** Photo gallery cho sự kiện: thành viên upload ảnh sau sự kiện.

### 5.8 Module: Chat & Communication `[P1][MW]`

**FR-CHAT-01:** Mỗi Classroom có 1 Main Conversation (chat chung lớp).
**FR-CHAT-02:** Không hỗ trợ Direct Message (DM) giữa cá nhân — by design, để tập trung giao tiếp trong lớp.
**FR-CHAT-03:** Tạo Thread từ bất kỳ tin nhắn nào trong Main Conversation để trao đổi chuyên sâu về một chủ đề.
**FR-CHAT-04:** Hỗ trợ gửi: text, emoji, ảnh, file đính kèm, link preview.
**FR-CHAT-05:** Mention @username, @tổ, @all.
**FR-CHAT-06:** Pin message quan trọng (Admin/Teacher/Monitor).
**FR-CHAT-07:** Reaction emoji trên tin nhắn.
**FR-CHAT-08:** Search tin nhắn theo nội dung, người gửi, ngày.
**FR-CHAT-09:** Mute conversation/thread notification.
**FR-CHAT-10:** Announcement mode: chỉ Admin/Teacher được gửi tin, thành viên chỉ đọc (toggleable).
**FR-CHAT-11:** Mỗi Group (tổ) cũng có 1 Group Conversation riêng.

### 5.9 Module: Attendance `[P1][MW]`

**FR-ATT-01:** Tạo phiên điểm danh (Attendance Session) cho buổi học cụ thể: ngày, tiết, môn học.
**FR-ATT-02:** Điểm danh nhanh: hiển thị danh sách, swipe hoặc tap để đánh dấu Có mặt / Vắng có phép / Vắng không phép / Đi trễ.
**FR-ATT-03:** Điểm danh bằng QR Code: Teacher tạo QR, học sinh scan trong thời gian giới hạn (ví dụ 5 phút).
**FR-ATT-04:** Điểm danh bằng GPS (P2): xác nhận vị trí trong bán kính lớp học.
**FR-ATT-05:** Thống kê điểm danh theo cá nhân: tỷ lệ chuyên cần %, số buổi vắng.
**FR-ATT-06:** Thống kê điểm danh theo lớp: biểu đồ xu hướng chuyên cần theo tuần/tháng.
**FR-ATT-07:** Tự động trừ điểm thi đua khi vắng không phép (configurable).
**FR-ATT-08:** Notification cho phụ huynh khi học sinh vắng.
**FR-ATT-09:** Export báo cáo điểm danh dạng PDF/Excel.

### 5.10 Module: Parent Portal `[P2][M]`

**FR-PAR-01:** Phụ huynh liên kết tài khoản với học sinh thông qua Invite Code + xác nhận từ Admin.
**FR-PAR-02:** Dashboard phụ huynh: thông tin tổng quan về con em (điểm thi đua, điểm danh, xếp hạng).
**FR-PAR-03:** Xem báo cáo thi đua tuần/tháng/học kỳ của con em.
**FR-PAR-04:** Xem lịch sử điểm danh.
**FR-PAR-05:** Gửi Absence Request (xin phép nghỉ) cho con em: ngày nghỉ, lý do → Teacher approve/reject.
**FR-PAR-06:** Nhận notification khi con em: vắng học, bị trừ điểm, có sự kiện bắt buộc.
**FR-PAR-07:** Teacher gửi Report Card (phiếu đánh giá) cho phụ huynh theo tuần/tháng/học kỳ.
**FR-PAR-08:** Phụ huynh reply/comment trên Report Card.
**FR-PAR-09:** Xem thông tin quỹ lớp và trạng thái đóng quỹ của con em.
**FR-PAR-10:** Giao diện đơn giản, tối ưu cho phụ huynh ít thông thạo công nghệ.

### 5.11 Module: Notification & Scheduling `[P1][MW]`

**FR-NOTI-01:** Push notification (FCM) cho tất cả events: chat, điểm danh, thi đua, quỹ, sự kiện, phân công.
**FR-NOTI-02:** In-app notification center với badge count.
**FR-NOTI-03:** Email digest: tổng hợp weekly gửi email (configurable).
**FR-NOTI-04:** Notification preferences: cho phép mute từng loại notification.
**FR-NOTI-05:** Smart notification: gộp nhiều notification cùng loại (batching), tránh spam.
**FR-NOTI-06:** Scheduled jobs: tổng kết thi đua, nhắc nộp quỹ, nhắc trực nhật.

### 5.12 Module: Reports & Analytics `[P2][W]`

**FR-RPT-01:** Dashboard tổng quan Classroom: sĩ số, thi đua, chuyên cần, quỹ — all in one.
**FR-RPT-02:** Biểu đồ so sánh thi đua giữa các tổ (bar chart, radar chart).
**FR-RPT-03:** Biểu đồ xu hướng thi đua cá nhân/tổ theo thời gian (line chart).
**FR-RPT-04:** Heatmap điểm danh: lịch dạng heatmap hiển thị mức độ chuyên cần.
**FR-RPT-05:** Report Card generator: tổng hợp thông tin cá nhân → PDF đẹp.
**FR-RPT-06:** Comparative analytics: so sánh kết quả giữa các tuần/tháng/học kỳ.

### 5.13 Tính năng bổ sung (Proposed)

#### Timetable / Thời khóa biểu `[P2][MW]`

**FR-TIME-01:** Nhập thời khóa biểu lớp: ngày, tiết, môn, phòng học, giáo viên.
**FR-TIME-02:** Hiển thị dạng weekly calendar.
**FR-TIME-03:** Notification nhắc trước giờ học 15 phút.
**FR-TIME-04:** Cập nhật thay đổi lịch (đổi phòng, nghỉ học) với notification.

#### Achievement / Badge System `[P3][MW]`

**FR-ACH-01:** Hệ thống huy hiệu cho thành viên: "Chuyên cần 100%", "Top thi đua tuần", "Nộp bài sớm nhất"...
**FR-ACH-02:** Gamification: streak (chuỗi ngày) chuyên cần, level dựa trên điểm thi đua tích lũy.

#### AI-Assisted Features `[P3][MW]`

**FR-AI-01:** Tóm tắt chat conversation hằng ngày.
**FR-AI-02:** Gợi ý phân công trực nhật công bằng dựa trên lịch sử.
**FR-AI-03:** Dự đoán xu hướng thi đua và cảnh báo sớm thành viên có nguy cơ.

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Metric | Target |
|--------|--------|
| API Response Time (P95) | < 200ms (read), < 500ms (write) |
| WebSocket Message Latency | < 100ms |
| Page Load Time (Web) | < 2s (FCP), < 3s (LCP) |
| App Launch Time (Mobile) | < 1.5s (cold start) |
| Concurrent Users per Classroom | 200 |
| Max Classrooms per Instance | 10,000 |

### 6.2 Scalability

- Horizontal scaling via container orchestration (Docker Compose → Kubernetes khi cần).
- Database read replicas cho query-heavy operations (reports, analytics).
- Redis cluster cho cache và pub/sub scale.
- MinIO distributed mode cho storage scale.

### 6.3 Availability

- Target uptime: 99.5% (cho self-hosted), 99.9% (cho cloud deployment).
- Graceful degradation: chat vẫn hoạt động khi module Report down.
- Circuit breaker pattern cho external services (payment, email).

### 6.4 Data Retention

| Data Type | Retention |
|-----------|-----------|
| Chat messages | 2 năm |
| Documents | Unlimited (within storage quota) |
| Attendance records | 5 năm |
| Fund transactions | 5 năm (audit requirement) |
| Emulation entries | 3 năm |
| Archived Classrooms | 90 ngày sau khi archive |
| Audit logs | 5 năm |

### 6.5 Localization

- Primary: Tiếng Việt (vi-VN)
- Secondary: English (en-US)
- Date/Time: GMT+7, format dd/MM/yyyy
- Currency: VND

---

## 7. System Architecture

### 7.1 Backend Architecture (Spring Boot)

```
src/main/java/com/classroomhub/
├── ClassroomHubApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   ├── RedisConfig.java
│   ├── MinioConfig.java
│   ├── RabbitMQConfig.java
│   ├── SwaggerConfig.java
│   └── CorsConfig.java
├── common/
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── BusinessException.java
│   │   └── ErrorCode.java
│   ├── dto/
│   │   ├── ApiResponse.java
│   │   ├── PageResponse.java
│   │   └── ErrorResponse.java
│   ├── util/
│   │   ├── SecurityUtils.java
│   │   ├── DateUtils.java
│   │   └── SlugUtils.java
│   └── annotation/
│       ├── RequireRole.java
│       └── AuditLog.java
├── domain/
│   ├── auth/
│   │   ├── controller/AuthController.java
│   │   ├── service/AuthService.java
│   │   ├── repository/UserRepository.java
│   │   ├── entity/User.java
│   │   ├── dto/LoginRequest.java
│   │   └── security/JwtTokenProvider.java
│   ├── classroom/
│   │   ├── controller/ClassroomController.java
│   │   ├── service/ClassroomService.java
│   │   ├── repository/ClassroomRepository.java
│   │   ├── entity/
│   │   │   ├── Classroom.java
│   │   │   ├── ClassroomMember.java
│   │   │   └── SeatingChart.java
│   │   └── dto/...
│   ├── group/
│   │   ├── controller/GroupController.java
│   │   ├── service/GroupService.java
│   │   ├── entity/
│   │   │   ├── Group.java
│   │   │   └── GroupMember.java
│   │   └── dto/...
│   ├── emulation/
│   │   ├── controller/EmulationController.java
│   │   ├── service/EmulationService.java
│   │   ├── entity/
│   │   │   ├── EmulationEntry.java
│   │   │   ├── EmulationCategory.java
│   │   │   └── EmulationSummary.java
│   │   └── dto/...
│   ├── duty/
│   │   ├── controller/DutyController.java
│   │   ├── service/DutyService.java
│   │   ├── entity/
│   │   │   ├── DutyType.java
│   │   │   ├── DutyAssignment.java
│   │   │   └── DutySchedule.java
│   │   └── dto/...
│   ├── document/
│   │   ├── controller/DocumentController.java
│   │   ├── service/DocumentService.java
│   │   ├── entity/
│   │   │   ├── Folder.java
│   │   │   ├── Document.java
│   │   │   └── ShareLink.java
│   │   └── dto/...
│   ├── fund/
│   │   ├── controller/FundController.java
│   │   ├── service/FundService.java
│   │   ├── entity/
│   │   │   ├── Fund.java
│   │   │   ├── FundCollection.java
│   │   │   ├── FundPayment.java
│   │   │   ├── FundExpense.java
│   │   │   └── FundAuditLog.java
│   │   └── dto/...
│   ├── event/
│   │   ├── controller/EventController.java
│   │   ├── service/EventService.java
│   │   ├── entity/
│   │   │   ├── Event.java
│   │   │   ├── EventRsvp.java
│   │   │   ├── AbsenceRequest.java
│   │   │   ├── Poll.java
│   │   │   └── PollVote.java
│   │   └── dto/...
│   ├── chat/
│   │   ├── controller/ChatWebSocketController.java
│   │   ├── service/ChatService.java
│   │   ├── entity/
│   │   │   ├── Conversation.java
│   │   │   ├── Message.java
│   │   │   └── Thread.java
│   │   └── dto/...
│   ├── attendance/
│   │   ├── controller/AttendanceController.java
│   │   ├── service/AttendanceService.java
│   │   ├── entity/
│   │   │   ├── AttendanceSession.java
│   │   │   └── AttendanceRecord.java
│   │   └── dto/...
│   ├── parent/
│   │   ├── controller/ParentController.java
│   │   ├── service/ParentService.java
│   │   ├── entity/
│   │   │   ├── ParentLink.java
│   │   │   └── ReportCard.java
│   │   └── dto/...
│   ├── notification/
│   │   ├── service/NotificationService.java
│   │   ├── service/FcmService.java
│   │   ├── service/EmailService.java
│   │   ├── entity/Notification.java
│   │   └── listener/NotificationEventListener.java
│   └── report/
│       ├── controller/ReportController.java
│       ├── service/ReportService.java
│       └── dto/...
├── infrastructure/
│   ├── minio/MinioStorageService.java
│   ├── payment/
│   │   ├── VietQRService.java
│   │   └── SePayWebhookController.java
│   ├── scheduling/
│   │   ├── EmulationScheduler.java
│   │   ├── FundReminderScheduler.java
│   │   └── DutyReminderScheduler.java
│   └── websocket/
│       ├── WebSocketEventListener.java
│       └── WebSocketSessionManager.java
```

### 7.2 Design Patterns Applied

| Pattern | Where | Purpose |
|---------|-------|---------|
| **Domain-Driven Design** | Package structure | Bounded contexts per module |
| **Repository Pattern** | Data access | Abstract data layer |
| **Service Layer** | Business logic | Separation of concerns |
| **Observer/Event-Driven** | Notification, Emulation | Decouple modules via Spring Events + RabbitMQ |
| **Strategy Pattern** | Payment, Auth | Multiple payment/auth providers |
| **Builder Pattern** | Report generation | Complex report assembly |
| **Specification Pattern** | Search/Filter | Dynamic query building |
| **Circuit Breaker** | External services | Resilience (via Resilience4j) |
| **CQRS (Lightweight)** | Reports | Separate read models for analytics |

### 7.3 Mobile Architecture (KMP)

```
shared/
├── commonMain/
│   ├── data/
│   │   ├── remote/          # Ktor HTTP client, API definitions
│   │   ├── local/           # SQLDelight, DataStore
│   │   ├── repository/      # Repository implementations
│   │   └── model/           # Data models / DTOs
│   ├── domain/
│   │   ├── model/           # Domain entities
│   │   ├── repository/      # Repository interfaces
│   │   └── usecase/         # Business logic use cases
│   └── presentation/
│       ├── ui/
│       │   ├── theme/       # Colors, Typography, Shapes
│       │   ├── components/  # Reusable Compose components
│       │   ├── screens/     # Screen composables
│       │   └── navigation/  # Navigation graph
│       └── viewmodel/       # Shared ViewModels
├── androidMain/             # Android-specific (FCM, permissions)
└── iosMain/                 # iOS-specific (APNs, HealthKit)

androidApp/                  # Android entry point
iosApp/                      # iOS entry point
```

### 7.4 Web Frontend Architecture (React TS)

```
src/
├── app/
│   ├── routes/              # React Router v6 routes
│   ├── store/               # Zustand stores
│   └── providers/           # Context providers
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── classroom/
│   ├── emulation/
│   ├── fund/
│   ├── events/
│   ├── documents/
│   ├── chat/
│   ├── attendance/
│   ├── reports/
│   └── parent/
├── shared/
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Utilities
│   ├── types/               # Shared TypeScript types
│   └── api/                 # Axios instance, interceptors
├── assets/
└── styles/
```

---

## 8. Database Design

### 8.1 Entity Relationship Overview

```
users ──────────────── classroom_members ──────────── classrooms
  │                         │                            │
  │                    group_members ────── groups ───────┤
  │                         │                            │
  ├── emulation_entries ────┘                            │
  │                                                      │
  ├── attendance_records ── attendance_sessions ─────────┤
  │                                                      │
  ├── fund_payments ─────── fund_collections ── funds ──┤
  │                                                      │
  ├── documents ─────────── folders ─────────────────────┤
  │                                                      │
  ├── messages ──────────── conversations ───────────────┤
  │       └── threads                                    │
  │                                                      │
  ├── event_rsvps ───────── events ──────────────────────┤
  │                                                      │
  ├── parent_links ──────── report_cards                 │
  │                                                      │
  └── notifications                                      │
                                                         │
      seating_charts ────────────────────────────────────┘
      duty_assignments ──── duty_schedules ──────────────┘
      polls ── poll_votes ───────────────────────────────┘
```

### 8.2 Core Tables

#### `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| phone | VARCHAR(20) | UNIQUE, NULLABLE | |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt |
| display_name | VARCHAR(100) | NOT NULL | |
| avatar_url | VARCHAR(500) | NULLABLE | MinIO path |
| date_of_birth | DATE | NULLABLE | |
| user_type | ENUM | NOT NULL | STUDENT, TEACHER, PARENT |
| status | ENUM | NOT NULL | ACTIVE, INACTIVE, BANNED |
| locale | VARCHAR(10) | DEFAULT 'vi-VN' | |
| fcm_tokens | JSONB | DEFAULT '[]' | array of device tokens |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Indexes:** `idx_users_email`, `idx_users_phone`, `idx_users_status`

#### `classrooms`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| name | VARCHAR(200) | NOT NULL | |
| description | TEXT | NULLABLE | |
| academic_year | VARCHAR(20) | NOT NULL | e.g., "2025-2026" |
| school_level | ENUM | NOT NULL | THCS, THPT, CAO_DANG, DAI_HOC |
| class_code | VARCHAR(20) | NULLABLE | e.g., "12A1" |
| invite_code | VARCHAR(8) | UNIQUE, NOT NULL | |
| invite_code_expires_at | TIMESTAMPTZ | NULLABLE | |
| cover_image_url | VARCHAR(500) | NULLABLE | |
| owner_id | UUID | FK → users | |
| settings | JSONB | NOT NULL | module toggles, configs |
| status | ENUM | NOT NULL | ACTIVE, ARCHIVED, DELETED |
| max_members | INT | DEFAULT 60 | |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NOT NULL | |

**Indexes:** `idx_classrooms_invite_code`, `idx_classrooms_owner`, `idx_classrooms_status`

#### `classroom_members`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| user_id | UUID | FK → users | |
| role | ENUM | NOT NULL | OWNER, TEACHER, MONITOR, VICE_MONITOR, GROUP_LEADER, TREASURER, MEMBER |
| student_number | INT | NULLABLE | Số thứ tự trong lớp |
| joined_at | TIMESTAMPTZ | NOT NULL | |
| status | ENUM | NOT NULL | ACTIVE, LEFT, REMOVED |

**Indexes:** `UNIQUE(classroom_id, user_id)`, `idx_cm_classroom`, `idx_cm_user`

#### `groups`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| name | VARCHAR(100) | NOT NULL | |
| color | VARCHAR(7) | NOT NULL | hex color |
| leader_id | UUID | FK → users | |
| display_order | INT | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `group_members`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| group_id | UUID | FK → groups | |
| member_id | UUID | FK → classroom_members | |

**Index:** `UNIQUE(group_id, member_id)`

#### `emulation_entries`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| group_id | UUID | FK → groups | |
| member_id | UUID | FK → classroom_members | |
| category_id | UUID | FK → emulation_categories | |
| type | ENUM | NOT NULL | PLUS, MINUS |
| points | INT | NOT NULL | absolute value |
| reason | TEXT | NOT NULL | |
| date | DATE | NOT NULL | |
| scored_by | UUID | FK → users | |
| created_at | TIMESTAMPTZ | NOT NULL | |

**Indexes:** `idx_emu_classroom_date`, `idx_emu_member_date`, `idx_emu_group_date`

#### `emulation_categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| name | VARCHAR(100) | NOT NULL | e.g., "Đi trễ" |
| type | ENUM | NOT NULL | PLUS, MINUS |
| default_points | INT | NOT NULL | |
| is_active | BOOLEAN | DEFAULT true | |

#### `emulation_summaries`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK | |
| period_type | ENUM | NOT NULL | WEEKLY, MONTHLY, SEMESTER, YEARLY |
| period_start | DATE | NOT NULL | |
| period_end | DATE | NOT NULL | |
| summary_data | JSONB | NOT NULL | aggregated scores per member/group |
| generated_at | TIMESTAMPTZ | NOT NULL | |

#### `funds`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| name | VARCHAR(200) | NOT NULL | |
| description | TEXT | NULLABLE | |
| balance | BIGINT | NOT NULL DEFAULT 0 | in VND |
| is_transparent | BOOLEAN | DEFAULT true | |
| status | ENUM | NOT NULL | ACTIVE, CLOSED |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `fund_collections`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| fund_id | UUID | FK → funds | |
| title | VARCHAR(200) | NOT NULL | |
| amount_per_person | BIGINT | NOT NULL | VND |
| due_date | DATE | NOT NULL | |
| status | ENUM | NOT NULL | OPEN, CLOSED |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `fund_payments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| collection_id | UUID | FK → fund_collections | |
| member_id | UUID | FK → classroom_members | |
| amount | BIGINT | NOT NULL | |
| payment_method | ENUM | NOT NULL | CASH, BANK_TRANSFER, VIETQR |
| transaction_ref | VARCHAR(100) | NULLABLE | from payment gateway |
| status | ENUM | NOT NULL | PENDING, CONFIRMED, REJECTED |
| confirmed_by | UUID | FK → users, NULLABLE | |
| paid_at | TIMESTAMPTZ | NULLABLE | |
| confirmed_at | TIMESTAMPTZ | NULLABLE | |

#### `fund_expenses`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| fund_id | UUID | FK → funds | |
| amount | BIGINT | NOT NULL | |
| reason | VARCHAR(500) | NOT NULL | |
| receipt_url | VARCHAR(500) | NULLABLE | ảnh chứng từ |
| spent_by | UUID | FK → users | |
| approved_by | UUID | FK → users, NULLABLE | |
| spent_at | DATE | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `fund_audit_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| fund_id | UUID | FK → funds | |
| action | VARCHAR(50) | NOT NULL | CREATE, UPDATE, DELETE, PAYMENT, EXPENSE |
| entity_type | VARCHAR(50) | NOT NULL | COLLECTION, PAYMENT, EXPENSE |
| entity_id | UUID | NOT NULL | |
| old_value | JSONB | NULLABLE | |
| new_value | JSONB | NULLABLE | |
| performed_by | UUID | FK → users | |
| performed_at | TIMESTAMPTZ | NOT NULL | |

#### `attendance_sessions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| date | DATE | NOT NULL | |
| period | VARCHAR(50) | NULLABLE | "Tiết 1", "Sáng"... |
| subject | VARCHAR(100) | NULLABLE | |
| qr_code | VARCHAR(100) | NULLABLE | for QR attendance |
| qr_expires_at | TIMESTAMPTZ | NULLABLE | |
| created_by | UUID | FK → users | |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `attendance_records`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| session_id | UUID | FK → attendance_sessions | |
| member_id | UUID | FK → classroom_members | |
| status | ENUM | NOT NULL | PRESENT, ABSENT_EXCUSED, ABSENT_UNEXCUSED, LATE |
| check_in_method | ENUM | NULLABLE | MANUAL, QR_CODE, GPS |
| checked_at | TIMESTAMPTZ | NULLABLE | |
| note | TEXT | NULLABLE | |

**Index:** `UNIQUE(session_id, member_id)`

#### `conversations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| type | ENUM | NOT NULL | MAIN, GROUP |
| group_id | UUID | FK → groups, NULLABLE | only if type=GROUP |
| is_announcement_mode | BOOLEAN | DEFAULT false | |

#### `messages`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| conversation_id | UUID | FK → conversations | |
| thread_id | UUID | FK → threads, NULLABLE | |
| sender_id | UUID | FK → users | |
| content | TEXT | NOT NULL | |
| message_type | ENUM | NOT NULL | TEXT, IMAGE, FILE, SYSTEM |
| attachments | JSONB | DEFAULT '[]' | |
| is_pinned | BOOLEAN | DEFAULT false | |
| reactions | JSONB | DEFAULT '{}' | {"👍": ["user1", "user2"]} |
| created_at | TIMESTAMPTZ | NOT NULL | |
| updated_at | TIMESTAMPTZ | NULLABLE | |

**Indexes:** `idx_msg_conversation_created`, `idx_msg_thread`
**Partitioning:** Range partition by `created_at` (monthly)

#### `threads`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| conversation_id | UUID | FK → conversations | |
| parent_message_id | UUID | FK → messages | |
| title | VARCHAR(200) | NULLABLE | |
| reply_count | INT | DEFAULT 0 | |
| last_reply_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| title | VARCHAR(300) | NOT NULL | |
| description | TEXT | NULLABLE | |
| location | VARCHAR(300) | NULLABLE | |
| start_time | TIMESTAMPTZ | NOT NULL | |
| end_time | TIMESTAMPTZ | NULLABLE | |
| is_mandatory | BOOLEAN | DEFAULT false | |
| cover_image_url | VARCHAR(500) | NULLABLE | |
| recurrence_rule | VARCHAR(200) | NULLABLE | RRULE format |
| created_by | UUID | FK → users | |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `event_rsvps`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| event_id | UUID | FK → events | |
| member_id | UUID | FK → classroom_members | |
| status | ENUM | NOT NULL | GOING, NOT_GOING, MAYBE, PENDING |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `absence_requests`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| event_id | UUID | FK → events, NULLABLE | |
| classroom_id | UUID | FK → classrooms | |
| requester_id | UUID | FK → users | student or parent |
| student_id | UUID | FK → classroom_members | |
| absence_date | DATE | NOT NULL | |
| reason | TEXT | NOT NULL | |
| status | ENUM | NOT NULL | PENDING, APPROVED, REJECTED |
| reviewed_by | UUID | FK → users, NULLABLE | |
| reviewed_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `parent_links`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| parent_id | UUID | FK → users | |
| student_id | UUID | FK → users | |
| classroom_id | UUID | FK → classrooms | |
| relationship | VARCHAR(50) | NOT NULL | Bố, Mẹ, Người giám hộ |
| status | ENUM | NOT NULL | PENDING, APPROVED, REJECTED |
| approved_by | UUID | FK → users, NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `folders`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| parent_folder_id | UUID | FK → folders, NULLABLE | |
| name | VARCHAR(200) | NOT NULL | |
| type | ENUM | NOT NULL | SHARED, PERSONAL, ASSIGNMENT |
| owner_id | UUID | FK → users, NULLABLE | for PERSONAL folders |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `documents`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| folder_id | UUID | FK → folders | |
| filename | VARCHAR(300) | NOT NULL | |
| file_path | VARCHAR(500) | NOT NULL | MinIO path |
| file_size | BIGINT | NOT NULL | bytes |
| mime_type | VARCHAR(100) | NOT NULL | |
| version | INT | DEFAULT 1 | |
| tags | TEXT[] | DEFAULT '{}' | |
| uploaded_by | UUID | FK → users | |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `seating_charts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| name | VARCHAR(100) | NOT NULL | |
| rows | INT | NOT NULL | |
| columns | INT | NOT NULL | |
| layout_data | JSONB | NOT NULL | [{row, col, memberId}] |
| is_active | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `duty_types`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| name | VARCHAR(100) | NOT NULL | "Trực nhật", "Vệ sinh"... |
| emulation_plus | INT | DEFAULT 0 | points when completed |
| emulation_minus | INT | DEFAULT 0 | points when missed |
| is_active | BOOLEAN | DEFAULT true | |

#### `duty_assignments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| duty_type_id | UUID | FK → duty_types | |
| member_id | UUID | FK → classroom_members, NULLABLE | |
| group_id | UUID | FK → groups, NULLABLE | assign to group or individual |
| assigned_date | DATE | NOT NULL | |
| status | ENUM | NOT NULL | PENDING, COMPLETED, MISSED |
| completed_at | TIMESTAMPTZ | NULLABLE | |
| verified_by | UUID | FK → users, NULLABLE | |

#### `polls`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| classroom_id | UUID | FK → classrooms | |
| event_id | UUID | FK → events, NULLABLE | |
| question | TEXT | NOT NULL | |
| poll_type | ENUM | NOT NULL | SINGLE, MULTIPLE, RANKING |
| options | JSONB | NOT NULL | [{id, text}] |
| is_anonymous | BOOLEAN | DEFAULT false | |
| show_results_before_end | BOOLEAN | DEFAULT true | |
| closes_at | TIMESTAMPTZ | NULLABLE | |
| created_by | UUID | FK → users | |
| created_at | TIMESTAMPTZ | NOT NULL | |

#### `poll_votes`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| poll_id | UUID | FK → polls | |
| voter_id | UUID | FK → users | |
| selected_options | JSONB | NOT NULL | [optionId] or [{optionId, rank}] |
| voted_at | TIMESTAMPTZ | NOT NULL | |

**Index:** `UNIQUE(poll_id, voter_id)`

#### `notifications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users | |
| classroom_id | UUID | FK → classrooms, NULLABLE | |
| type | VARCHAR(50) | NOT NULL | CHAT, EMULATION, FUND, EVENT, ATTENDANCE, DUTY, SYSTEM |
| title | VARCHAR(300) | NOT NULL | |
| body | TEXT | NOT NULL | |
| data | JSONB | NULLABLE | deep link data |
| is_read | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL | |

**Indexes:** `idx_noti_user_read`, `idx_noti_user_created`
**Partitioning:** Range partition by `created_at` (monthly)

### 8.3 Database Optimization Strategy

- **Partitioning:** `messages` và `notifications` partition theo tháng (volume lớn).
- **Materialized Views:** `emulation_summaries` sử dụng materialized view cho aggregate queries, refresh theo schedule.
- **JSONB Indexes:** GIN index trên `settings`, `layout_data`, `reactions` cho query performance.
- **Connection Pooling:** HikariCP với max pool size = 20, min idle = 5.
- **Read Replicas:** Streaming replication cho report queries (P3).

---

## 9. API Design

### 9.1 API Conventions

- **Base URL:** `https://api.classroomhub.app/v1`
- **Format:** JSON
- **Authentication:** Bearer JWT Token
- **Pagination:** Cursor-based (cho chat, notifications) hoặc Offset-based (cho lists).
- **Versioning:** URL path (`/v1/`, `/v2/`)
- **Rate Limiting:** 100 req/min per user (general), 30 req/min (write operations)

### 9.2 Standard Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8
  },
  "timestamp": "2026-04-12T10:30:00+07:00"
}
```

```json
{
  "success": false,
  "error": {
    "code": "CLASSROOM_NOT_FOUND",
    "message": "Không tìm thấy lớp học",
    "details": []
  },
  "timestamp": "2026-04-12T10:30:00+07:00"
}
```

### 9.3 API Endpoint Summary

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Đăng ký tài khoản |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/forgot-password` | Gửi OTP reset password |
| POST | `/auth/reset-password` | Reset password bằng OTP |
| POST | `/auth/logout` | Đăng xuất |
| DELETE | `/auth/sessions` | Revoke all sessions |
| GET | `/auth/me` | Profile hiện tại |
| PUT | `/auth/me` | Update profile |
| POST | `/auth/me/avatar` | Upload avatar |
| POST | `/auth/oauth/google` | Google OAuth2 |
| POST | `/auth/oauth/apple` | Apple Sign-In |

#### Classrooms

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/classrooms` | Tạo classroom |
| GET | `/classrooms` | Danh sách classrooms của user |
| GET | `/classrooms/:id` | Chi tiết classroom |
| PUT | `/classrooms/:id` | Update classroom info |
| DELETE | `/classrooms/:id` | Archive classroom |
| POST | `/classrooms/:id/join` | Join bằng invite code |
| POST | `/classrooms/:id/invite-code/regenerate` | Regenerate invite code |
| GET | `/classrooms/:id/members` | Danh sách thành viên |
| POST | `/classrooms/:id/members` | Thêm thành viên |
| PUT | `/classrooms/:id/members/:memberId/role` | Đổi role |
| DELETE | `/classrooms/:id/members/:memberId` | Xóa thành viên |
| POST | `/classrooms/:id/transfer` | Transfer ownership |
| PUT | `/classrooms/:id/settings` | Update settings |

#### Seating Chart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classrooms/:id/seating-charts` | Danh sách sơ đồ |
| POST | `/classrooms/:id/seating-charts` | Tạo sơ đồ |
| PUT | `/classrooms/:id/seating-charts/:chartId` | Cập nhật layout |
| PUT | `/classrooms/:id/seating-charts/:chartId/activate` | Set active |
| GET | `/classrooms/:id/class-size` | Sĩ số realtime |

#### Groups & Emulation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/classrooms/:id/groups` | Tạo tổ |
| GET | `/classrooms/:id/groups` | Danh sách tổ |
| PUT | `/classrooms/:id/groups/:groupId` | Update tổ |
| POST | `/classrooms/:id/groups/shuffle` | Shuffle thành viên |
| POST | `/classrooms/:id/emulation/entries` | Thêm điểm thi đua |
| GET | `/classrooms/:id/emulation/entries` | Lịch sử điểm thi đua |
| GET | `/classrooms/:id/emulation/leaderboard` | Bảng xếp hạng |
| GET | `/classrooms/:id/emulation/summary` | Tổng kết (query by period) |
| POST | `/classrooms/:id/emulation/summary/generate` | Trigger tổng kết |
| GET | `/classrooms/:id/emulation/charts` | Chart data |
| GET | `/classrooms/:id/emulation/categories` | Danh mục thi đua |
| POST | `/classrooms/:id/emulation/categories` | Tạo danh mục |

#### Duty Roster

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classrooms/:id/duty-types` | Loại nhiệm vụ |
| POST | `/classrooms/:id/duty-types` | Tạo loại nhiệm vụ |
| GET | `/classrooms/:id/duties` | Lịch phân công |
| POST | `/classrooms/:id/duties` | Phân công |
| POST | `/classrooms/:id/duties/auto-schedule` | Auto round-robin |
| PUT | `/classrooms/:id/duties/:dutyId/complete` | Đánh dấu hoàn thành |

#### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classrooms/:id/folders` | Danh sách folders |
| POST | `/classrooms/:id/folders` | Tạo folder |
| GET | `/classrooms/:id/folders/:folderId/documents` | Files trong folder |
| POST | `/classrooms/:id/documents/upload` | Upload file (multipart) |
| GET | `/classrooms/:id/documents/:docId` | Download file |
| GET | `/classrooms/:id/documents/:docId/preview` | Preview URL |
| POST | `/classrooms/:id/documents/:docId/share` | Tạo share link |
| GET | `/classrooms/:id/documents/search` | Tìm kiếm |
| DELETE | `/classrooms/:id/documents/:docId` | Xóa file |
| GET | `/classrooms/:id/my-folder` | Personal folder |

#### Fund Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classrooms/:id/funds` | Danh sách quỹ |
| POST | `/classrooms/:id/funds` | Tạo quỹ |
| GET | `/classrooms/:id/funds/:fundId/dashboard` | Dashboard quỹ |
| POST | `/classrooms/:id/funds/:fundId/collections` | Tạo đợt thu |
| GET | `/classrooms/:id/funds/:fundId/collections/:colId/payments` | Danh sách đóng quỹ |
| POST | `/classrooms/:id/funds/:fundId/collections/:colId/payments` | Ghi nhận thu |
| PUT | `/classrooms/:id/funds/:fundId/payments/:payId/confirm` | Xác nhận thanh toán |
| POST | `/classrooms/:id/funds/:fundId/expenses` | Ghi nhận chi |
| GET | `/classrooms/:id/funds/:fundId/audit-log` | Audit log |
| GET | `/classrooms/:id/funds/:fundId/report` | Báo cáo |
| POST | `/classrooms/:id/funds/:fundId/collections/:colId/vietqr` | Generate QR thanh toán |
| GET | `/classrooms/:id/funds/:fundId/export` | Export PDF/Excel |

#### Events & Polls

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/classrooms/:id/events` | Tạo sự kiện |
| GET | `/classrooms/:id/events` | Danh sách sự kiện |
| GET | `/classrooms/:id/events/:eventId` | Chi tiết sự kiện |
| POST | `/classrooms/:id/events/:eventId/rsvp` | RSVP |
| GET | `/classrooms/:id/events/:eventId/attendees` | Danh sách tham gia |
| POST | `/classrooms/:id/events/:eventId/absence-request` | Xin phép vắng |
| PUT | `/classrooms/:id/absence-requests/:reqId/review` | Duyệt xin phép |
| POST | `/classrooms/:id/polls` | Tạo poll |
| POST | `/classrooms/:id/polls/:pollId/vote` | Vote |
| GET | `/classrooms/:id/polls/:pollId/results` | Kết quả poll |

#### Chat (REST + WebSocket)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classrooms/:id/conversations` | Danh sách conversations |
| GET | `/classrooms/:id/conversations/:convId/messages` | Lịch sử tin nhắn (cursor-based) |
| POST | `/classrooms/:id/conversations/:convId/messages` | Gửi tin nhắn (fallback REST) |
| GET | `/classrooms/:id/conversations/:convId/threads` | Danh sách threads |
| POST | `/classrooms/:id/conversations/:convId/threads` | Tạo thread |
| PUT | `/classrooms/:id/messages/:msgId/pin` | Pin/Unpin |
| POST | `/classrooms/:id/messages/:msgId/reactions` | Add reaction |
| GET | `/classrooms/:id/messages/search` | Search tin nhắn |

**WebSocket endpoints:**

| Path | Description |
|------|-------------|
| `/ws/chat` | STOMP over SockJS |
| `/topic/classroom.{id}.messages` | Subscribe to new messages |
| `/topic/classroom.{id}.typing` | Typing indicators |
| `/app/chat.send` | Send message |
| `/app/chat.reaction` | Send reaction |

#### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/classrooms/:id/attendance/sessions` | Tạo phiên điểm danh |
| GET | `/classrooms/:id/attendance/sessions` | Danh sách phiên |
| POST | `/classrooms/:id/attendance/sessions/:sessId/records` | Điểm danh (batch) |
| POST | `/classrooms/:id/attendance/sessions/:sessId/qr-checkin` | Check-in bằng QR |
| GET | `/classrooms/:id/attendance/stats` | Thống kê chuyên cần |
| GET | `/classrooms/:id/attendance/stats/:memberId` | Thống kê cá nhân |
| GET | `/classrooms/:id/attendance/export` | Export |

#### Parent Portal

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/parent/link` | Liên kết với học sinh |
| GET | `/parent/children` | Danh sách con em |
| GET | `/parent/children/:studentId/dashboard` | Dashboard con em |
| GET | `/parent/children/:studentId/attendance` | Điểm danh con em |
| GET | `/parent/children/:studentId/emulation` | Thi đua con em |
| POST | `/parent/absence-requests` | Xin phép nghỉ |
| GET | `/parent/report-cards` | Phiếu đánh giá |
| POST | `/parent/report-cards/:cardId/reply` | Reply đánh giá |

#### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classrooms/:id/reports/overview` | Tổng quan classroom |
| GET | `/classrooms/:id/reports/emulation` | Báo cáo thi đua |
| GET | `/classrooms/:id/reports/attendance` | Báo cáo chuyên cần |
| GET | `/classrooms/:id/reports/fund` | Báo cáo tài chính |
| POST | `/classrooms/:id/reports/report-card` | Generate report card |
| POST | `/classrooms/:id/reports/export` | Export tổng hợp |

#### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Danh sách notifications |
| PUT | `/notifications/:id/read` | Đánh dấu đã đọc |
| PUT | `/notifications/read-all` | Đọc tất cả |
| GET | `/notifications/unread-count` | Số chưa đọc |
| PUT | `/notifications/preferences` | Cập nhật preferences |

---

## 10. Module Detail Design

### 10.1 Authentication Flow

```
┌─────────┐    POST /auth/login     ┌──────────┐
│  Client  │ ────────────────────►   │  Auth    │
│          │                         │ Service  │
│          │    {accessToken,        │          │
│          │ ◄──── refreshToken}     │          │
│          │                         │          │
│          │    GET /api/*           │          │
│          │    Authorization:       │          │
│          │ ──── Bearer {token} ──► │ JWT      │
│          │                         │ Filter   │
│          │    401 Unauthorized     │          │
│          │ ◄────── (if expired)    │          │
│          │                         │          │
│          │    POST /auth/refresh   │          │
│          │ ──── {refreshToken} ──► │          │
│          │                         │          │
│          │    {new accessToken}    │          │
│          │ ◄───────────────────    │          │
└─────────┘                         └──────────┘
```

**Token Strategy:**
- Access Token: JWT, 15 min TTL, chứa userId, roles, classroomId (per-classroom context).
- Refresh Token: Opaque token, 30 days TTL, stored in Redis, single-use (rotate on refresh).
- Device binding: mỗi refresh token gắn với device fingerprint.

### 10.2 Emulation Scoring Flow

```
Group Leader                Backend                    Redis Cache
     │                         │                          │
     │  POST /emulation/entries│                          │
     │ ─────────────────────►  │                          │
     │  {memberId, type:MINUS, │                          │
     │   points:1,             │                          │
     │   categoryId, date}     │                          │
     │                         │                          │
     │                         │── validate permissions ──│
     │                         │── save to DB ───────────►│
     │                         │── update cached scores ─►│
     │                         │── publish event ────────►│
     │                         │                          │
     │  201 Created            │                          │
     │ ◄─────────────────────  │                          │
     │                         │                          │
     │                    ┌────┴────┐                     │
     │                    │ Event   │                     │
     │                    │ Listener│                     │
     │                    └────┬────┘                     │
     │                         │                          │
     │                         │── notify member (FCM) ──►│
     │                         │── notify parent (FCM) ──►│
     │                         │── update leaderboard ───►│
     │                         │                          │
```

**Weekly Summary Generation (Scheduled Job):**
1. Chạy vào 23:59 Chủ nhật (configurable via `classroom.settings`)
2. Aggregate tất cả `emulation_entries` trong tuần theo member và group
3. Insert vào `emulation_summaries` (JSONB chứa breakdown)
4. Invalidate Redis cache cho leaderboard
5. Push notification tổng kết cho Admin/Teacher
6. Nếu có phụ huynh linked → gửi email digest

### 10.3 Fund Payment Flow (VietQR Integration)

```
Student/Parent              Backend               SePay/VietQR         Bank
     │                         │                      │                  │
     │  GET /fund/vietqr       │                      │                  │
     │ ─────────────────────►  │                      │                  │
     │                         │── gen QR content ───► │                  │
     │                         │   (account, amount,   │                  │
     │                         │    transfer content)   │                  │
     │  {qrImageUrl,           │                      │                  │
     │   bankInfo,             │                      │                  │
     │   transferContent}      │                      │                  │
     │ ◄─────────────────────  │                      │                  │
     │                         │                      │                  │
     │── scan QR & pay ───────────────────────────────────────────────►  │
     │                         │                      │                  │
     │                         │   Webhook callback   │                  │
     │                         │ ◄──── {txRef, amount, │ ◄── confirm ──  │
     │                         │        content}       │                  │
     │                         │                      │                  │
     │                         │── match payment ─────│                  │
     │                         │── update status ─────│                  │
     │                         │── audit log ─────────│                  │
     │                         │── notify via WS ─────│                  │
     │                         │                      │                  │
     │  WS: payment confirmed  │                      │                  │
     │ ◄─────────────────────  │                      │                  │
```

**Transfer Content Format:** `CH-{classroomShortId}-{collectionId}-{memberId}`
Ví dụ: `CH-12A1-QUY01-SV042`

**Matching Logic:**
1. SePay webhook → parse transfer content
2. Match `classroomShortId` + `collectionId` + `memberId`
3. Verify amount ≥ expected amount
4. Auto-confirm payment, update `fund_payments.status = CONFIRMED`
5. Update `funds.balance`
6. Create audit log entry
7. Push notification to Treasurer + Member
8. WebSocket broadcast to classroom fund dashboard

### 10.4 Chat & Thread Architecture

**Message Flow (WebSocket STOMP):**

```
Client A                  Spring Boot              Redis Pub/Sub         Client B
   │                         │                         │                    │
   │  STOMP SEND             │                         │                    │
   │  /app/chat.send         │                         │                    │
   │  {convId, content}      │                         │                    │
   │ ───────────────────►    │                         │                    │
   │                         │── persist to DB ───────►│                    │
   │                         │── publish to Redis ────►│                    │
   │                         │                         │── broadcast ──────►│
   │                         │── STOMP MESSAGE         │                    │
   │ ◄──── /topic/class.     │                         │                    │
   │       {id}.messages     │                         │                    │
   │                         │                         │    STOMP MESSAGE   │
   │                         │                         │ ──► /topic/class.  │
   │                         │                         │     {id}.messages  │
```

**Thread Design:**
- Thread là một sub-conversation tạo từ parent message
- Messages trong thread có `thread_id` != null
- Thread có `reply_count` và `last_reply_at` denormalized để hiển thị nhanh
- Client subscribe thêm `/topic/classroom.{id}.thread.{threadId}` khi mở thread

### 10.5 Attendance QR Code Flow

```
Teacher                    Backend                   Student
   │                         │                          │
   │  POST /attendance/      │                          │
   │       sessions          │                          │
   │ ───────────────────►    │                          │
   │                         │── generate session ─────►│
   │                         │── generate QR code       │
   │                         │   (JWT: sessionId,       │
   │                         │    classroomId,          │
   │                         │    exp: +5min)           │
   │  {sessionId,            │                          │
   │   qrCode (JWT),         │                          │
   │   qrImageUrl}           │                          │
   │ ◄─────────────────────  │                          │
   │                         │                          │
   │  [Display QR on screen] │                          │
   │                         │                          │
   │                         │  POST /attendance/       │
   │                         │       qr-checkin         │
   │                         │  {qrToken}               │
   │                         │ ◄────────────────────────│
   │                         │                          │
   │                         │── verify JWT ────────────│
   │                         │── check not expired ─────│
   │                         │── check membership ──────│
   │                         │── check not duplicate ───│
   │                         │── save record ───────────│
   │                         │                          │
   │                         │  200 {status: PRESENT}   │
   │                         │ ────────────────────────►│
   │                         │                          │
   │  WS: attendance updated │                          │
   │ ◄─────────────────────  │                          │
```

---

## 11. Platform Feature Matrix

| Feature | Mobile (KMP) | Web (React) | Notes |
|---------|:------------:|:-----------:|-------|
| **Auth & Profile** | ✅ Full | ✅ Full | |
| **Classroom CRUD** | ✅ Full | ✅ Full | |
| **Join via QR Scan** | ✅ | ❌ (link only) | Camera access on mobile |
| **Seating Chart (View)** | ✅ | ✅ | |
| **Seating Chart (Edit - Drag&Drop)** | ✅ Touch | ✅ Mouse | |
| **Group Management** | ✅ Basic | ✅ Full (bulk ops) | Web better for bulk |
| **Emulation Entry** | ✅ Quick entry | ✅ Full + bulk | |
| **Emulation Charts** | ✅ Basic charts | ✅ Advanced (interactive) | Web has richer viz |
| **Emulation Export** | ❌ (trigger → email) | ✅ Direct download | |
| **Duty Roster** | ✅ View + Complete | ✅ Full management | |
| **Document Upload** | ✅ (photos, files) | ✅ (drag-drop, bulk) | |
| **Document Preview** | ✅ In-app viewer | ✅ Browser viewer | |
| **Fund Dashboard** | ✅ Summary view | ✅ Full dashboard | |
| **Fund Payment (QR)** | ✅ Show QR + Scan | ✅ Show QR | |
| **Fund Export** | ❌ (trigger → email) | ✅ Direct download | |
| **Events Calendar** | ✅ Full | ✅ Full | |
| **RSVP & Absence** | ✅ | ✅ | |
| **Poll/Vote** | ✅ | ✅ | |
| **Chat** | ✅ Full | ✅ Full | |
| **Thread** | ✅ | ✅ | |
| **Attendance (Teacher)** | ✅ Full (QR gen) | ✅ Full | |
| **Attendance (Student QR)** | ✅ QR Scan | ❌ | Camera needed |
| **Push Notifications** | ✅ FCM | ❌ (in-app only) | |
| **Parent Portal** | ✅ Dedicated UI | ✅ Basic | Mobile-first for parents |
| **Reports Dashboard** | ✅ Summary | ✅ Full analytics | Web primary for reports |
| **Report Export (PDF/Excel)** | ❌ (trigger → email) | ✅ Direct download | |
| **Offline Support** | ✅ Basic (cache) | ❌ | |
| **Biometric Login** | ✅ (fingerprint/face) | ❌ | |

---

## 12. UI/UX Design Guidelines

### 12.1 Design System

**Color Palette:**

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--primary` | `#2563EB` | `#3B82F6` | Buttons, links, active states |
| `--primary-light` | `#DBEAFE` | `#1E3A5F` | Backgrounds, badges |
| `--success` | `#16A34A` | `#22C55E` | Có mặt, hoàn thành, nộp đủ |
| `--warning` | `#F59E0B` | `#FBBF24` | Xin phép, pending |
| `--danger` | `#DC2626` | `#EF4444` | Vắng, trừ điểm, quá hạn |
| `--neutral-50` | `#F8FAFC` | `#0F172A` | Page background |
| `--neutral-100` | `#F1F5F9` | `#1E293B` | Card background |
| `--neutral-900` | `#0F172A` | `#F8FAFC` | Text primary |

**Group Colors (predefined for tổ):**
- Tổ 1: `#3B82F6` (Blue)
- Tổ 2: `#EF4444` (Red)
- Tổ 3: `#22C55E` (Green)
- Tổ 4: `#F59E0B` (Amber)
- Tổ 5: `#8B5CF6` (Purple)
- Tổ 6: `#EC4899` (Pink)

### 12.2 Key Screen Flows

#### Home Screen (Mobile)

```
┌──────────────────────────────┐
│  ☰  ClassroomHub    🔔(3)   │
├──────────────────────────────┤
│                              │
│  ┌──────────────────────┐    │
│  │  12A1 - THPT ABC     │    │
│  │  👥 42/45  📅 T2-T7  │    │
│  └──────────────────────┘    │
│                              │
│  ┌─ Sơ đồ lớp ────────────┐ │
│  │ [■][■][■][■][■][■]     │ │
│  │ [■][■][🔴][■][■][■]    │ │
│  │ [■][🟡][■][■][■][■]    │ │
│  │ [■][■][■][■][■][■]     │ │
│  │         [  🟢  ]       │ │
│  │     ■=có  🔴=vắng      │ │
│  │     🟡=phép 🟢=GV      │ │
│  └─────────────────────────┘ │
│                              │
│  ┌─ Thi đua tuần 15 ──────┐ │
│  │  🥇 Tổ 3  ████████ 95  │ │
│  │  🥈 Tổ 1  ███████  87  │ │
│  │  🥉 Tổ 2  ██████   74  │ │
│  │     Tổ 4  █████    68  │ │
│  │            Xem chi tiết →│ │
│  └─────────────────────────┘ │
│                              │
│  ┌─ Sắp tới ──────────────┐ │
│  │  📅 15/04 Họp phụ huynh │ │
│  │  📅 17/04 Trực nhật: T3 │ │
│  │  💰 20/04 Hạn nộp quỹ  │ │
│  └─────────────────────────┘ │
│                              │
├──────────────────────────────┤
│  🏠   📊   💬   📁   👤    │
│ Home  Emu  Chat Docs Profile│
└──────────────────────────────┘
```

#### Emulation Detail Screen (Web)

```
┌───────────────────────────────────────────────────────────────┐
│  ← Thi đua lớp 12A1          Tuần 15 (07/04 - 13/04)  ▼    │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌── Tổng quan ─────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                   │ │
│  │   │  95 │  │  87 │  │  74 │  │  68 │   ← Bar Chart     │ │
│  │   │ ███ │  │ ███ │  │ ███ │  │ ███ │      by Group      │ │
│  │   │ ███ │  │ ███ │  │ ███ │  │ ███ │                    │ │
│  │   │ ███ │  │ ███ │  │ ███ │  │ ███ │                    │ │
│  │   │ Tổ3 │  │ Tổ1 │  │ Tổ2 │  │ Tổ4 │                   │ │
│  │   └─────┘  └─────┘  └─────┘  └─────┘                   │ │
│  │                                                           │ │
│  │   📈 Trend     📊 Distribution     🏅 Leaderboard       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌── Tổ 3 (Chi tiết) ── Leader: Nguyễn Văn A ──────────────┐ │
│  │                                                           │ │
│  │  #  Thành viên    | +  | -  | Net | Trend                │ │
│  │  ─────────────────┼────┼────┼─────┼──────                │ │
│  │  1  Trần Thị B    | 12 |  2 |  10 |  ↗️                  │ │
│  │  2  Lê Văn C      |  9 |  1 |   8 |  →                   │ │
│  │  3  Phạm Thị D    |  8 |  3 |   5 |  ↘️                  │ │
│  │  ...                                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌── Timeline (Line Chart) ─────────────────────────────────┐ │
│  │      Week 12  Week 13  Week 14  Week 15                  │ │
│  │  Tổ3  ──●───────●───────●───────●                        │ │
│  │  Tổ1  ──●───────●───────●───────●                        │ │
│  │  Tổ2  ──●───────●───────●───────●                        │ │
│  │  Tổ4  ──●───────●───────●───────●                        │ │
│  └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### 12.3 Mobile Navigation Structure

```
Bottom Navigation (5 tabs):
├── 🏠 Home
│   ├── Classroom Selector (top)
│   ├── Seating Chart + Class Size Widget
│   ├── Emulation Quick Summary
│   ├── Upcoming Events/Duties
│   └── Announcements
├── 📊 Emulation
│   ├── Leaderboard (Personal + Group)
│   ├── Quick Score Entry (for Group Leaders)
│   ├── My Score History
│   ├── Charts
│   └── Duty Roster
├── 💬 Chat
│   ├── Main Conversation
│   ├── Group Conversations
│   └── Threads
├── 📁 Resources
│   ├── Shared Folder
│   ├── My Folder
│   ├── Assignment Folders
│   └── Upload
└── 👤 Profile
    ├── My Profile
    ├── My Classrooms
    ├── Notifications Settings
    ├── Parent Link Management
    └── Settings
```

**Additional screens accessible via navigation/deep links:**
- Fund Management (from Home or via menu)
- Events Calendar
- Attendance
- Parent Portal (separate app flow for parents)

---

## 13. Security Design

### 13.1 Authentication & Authorization

| Aspect | Implementation |
|--------|---------------|
| Password Hashing | bcrypt (cost factor 12) |
| JWT Signing | RS256 (RSA 2048-bit key pair) |
| RBAC | Spring Security + custom `@RequireRole` annotation |
| Per-Classroom Auth | Middleware kiểm tra `classroom_members` role cho mỗi request |
| Rate Limiting | Bucket4j (Redis-backed) |
| Brute Force Protection | 5 failed login attempts → lock 15 min |

### 13.2 Data Security

| Aspect | Implementation |
|--------|---------------|
| Data in Transit | TLS 1.3 (Cloudflare / Let's Encrypt) |
| Data at Rest | PostgreSQL TDE (P3), MinIO server-side encryption |
| PII Protection | Sensitive fields encrypted at application level (AES-256-GCM) |
| File Access | Presigned URLs (MinIO) with 1-hour expiry |
| SQL Injection | Parameterized queries (Spring Data JPA) |
| XSS | Content sanitization (OWASP Java HTML Sanitizer) cho chat messages |
| CSRF | SameSite cookies + CSRF token cho web |
| CORS | Whitelist origins |

### 13.3 Privacy

- Folder cá nhân: access control enforce tại API level, MinIO bucket policy isolate per user.
- Chat: không có DM by design → giảm risk cyberbullying trong kênh riêng.
- Parent Portal: read-only, chỉ xem data con em mình, verified qua Admin approval.
- Data deletion: user yêu cầu xóa account → anonymize data sau 30 ngày (GDPR-style).

---

## 14. Integration & Third-Party Services

### 14.1 Payment Integration (VietQR + SePay)

| Config | Value |
|--------|-------|
| QR Format | VietQR standard (Napas) |
| Bank Account | Configurable per Classroom (Treasurer setup) |
| Transfer Content | Structured: `CH-{classCode}-{colId}-{memberId}` |
| Webhook | SePay webhook → `/api/v1/webhooks/sepay` |
| Security | HMAC-SHA256 signature verification on webhook |
| Fallback | Manual confirmation by Treasurer if webhook fails |

### 14.2 Firebase Cloud Messaging

| Config | Value |
|--------|-------|
| Platform | FCM HTTP v1 API |
| Token Storage | `users.fcm_tokens` (JSONB array) |
| Topics | `classroom_{id}`, `classroom_{id}_group_{groupId}` |
| Batching | Max 500 tokens per send, queued via RabbitMQ |
| Priority | High (attendance, urgent events), Normal (emulation, chat) |

### 14.3 Email (AWS SES)

| Type | Trigger |
|------|---------|
| Transactional | Password reset OTP, invite email |
| Weekly Digest | Tổng kết thi đua, chuyên cần (cho phụ huynh) |
| Report Card | Phiếu đánh giá gửi phụ huynh |
| Fund Reminder | Nhắc nộp quỹ |

Template engine: Thymeleaf (server-side rendering for email HTML).

### 14.4 MinIO Object Storage

| Bucket | Purpose | Access |
|--------|---------|--------|
| `classroom-shared` | Tài liệu chung | Presigned URL (read), authenticated upload |
| `classroom-personal` | Folder cá nhân | Strict IAM policy per user prefix |
| `classroom-assignments` | Bài tập | Teacher full access, student own-folder only |
| `classroom-media` | Chat images, avatars, receipts | Presigned URL |

---

## 15. Deployment Architecture

### 15.1 Docker Compose (Development / Small Scale)

```yaml
services:
  api:
    build: ./backend
    ports: ["8080:8080"]
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_URL: jdbc:postgresql://postgres:5432/classroomhub
      REDIS_HOST: redis
      MINIO_ENDPOINT: http://minio:9000
      RABBITMQ_HOST: rabbitmq
    depends_on: [postgres, redis, minio, rabbitmq]

  web:
    build: ./web-frontend
    ports: ["3000:80"]
    # Nginx serving React build

  postgres:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]
    environment:
      POSTGRES_DB: classroomhub
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes: ["redisdata:/data"]

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    volumes: ["miniodata:/data"]

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports: ["5672:5672", "15672:15672"]

  traefik:
    image: traefik:v3.0
    ports: ["80:80", "443:443"]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik:/etc/traefik
```

### 15.2 Production Deployment (Kubernetes - Scale Phase)

```
                    Cloudflare CDN
                         │
                    ┌─────┴─────┐
                    │  Ingress   │
                    │ Controller │
                    └─────┬─────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
         ┌────┴────┐ ┌────┴────┐ ┌───┴────┐
         │ API Pod │ │ API Pod │ │Web Pod │
         │  (x3)   │ │  (x3)   │ │ (x2)   │
         └────┬────┘ └────┬────┘ └────────┘
              │           │
    ┌─────────┼───────────┘
    │         │
┌───┴───┐ ┌──┴───┐ ┌──────┐ ┌────────┐
│  PG   │ │Redis │ │MinIO │ │RabbitMQ│
│Primary│ │Cluster│ │(3node)│ │ (HA)  │
│+ Read │ │      │ │      │ │       │
│Replica│ │      │ │      │ │       │
└───────┘ └──────┘ └──────┘ └────────┘
```

### 15.3 CI/CD Pipeline

```
GitHub Push → GitHub Actions:
  1. Lint + Unit Tests
  2. Integration Tests (Testcontainers)
  3. Build Docker images
  4. Push to Container Registry
  5. Deploy to Staging (auto)
  6. Deploy to Production (manual approval)
```

---

## 16. Testing Strategy

### 16.1 Test Pyramid

| Layer | Type | Coverage Target | Tools |
|-------|------|----------------|-------|
| Unit | Service logic, Utils | 80% | JUnit 5, Mockito, MockK (KMP) |
| Integration | Repository, API | 70% | Testcontainers (PG, Redis), MockMvc |
| Contract | API contracts | All endpoints | Spring Cloud Contract |
| E2E | Critical flows | 15 flows | Playwright (Web), Maestro (Mobile) |
| Performance | Load testing | Key endpoints | Gatling / k6 |

### 16.2 Critical Test Scenarios

1. **Auth flow:** Register → Login → Refresh → Access protected resource
2. **Classroom lifecycle:** Create → Invite → Join → Assign roles → Archive
3. **Emulation scoring:** Entry → Weekly summary → Leaderboard update
4. **Fund payment:** Create collection → Generate QR → Webhook confirm → Balance update
5. **Chat:** Send message → Thread creation → Real-time delivery
6. **Attendance:** Create session → QR check-in → Stats update → Parent notification
7. **Concurrent access:** Multiple group leaders scoring simultaneously
8. **Payment idempotency:** Duplicate webhook calls should not double-count

---

## 17. Performance & Scalability

### 17.1 Caching Strategy

| Data | Cache Layer | TTL | Invalidation |
|------|-------------|-----|-------------|
| User session | Redis | 15 min | On logout/token refresh |
| Classroom member list | Redis | 10 min | On member change event |
| Emulation leaderboard | Redis Sorted Set | 5 min | On new entry event |
| Seating chart | Redis | 30 min | On layout update |
| Class size (realtime) | Redis | 1 min | On attendance event |
| Fund balance | Redis | 2 min | On payment/expense event |
| Notification unread count | Redis | realtime | On read event |

### 17.2 Database Optimization

| Optimization | Details |
|-------------|---------|
| Connection Pool | HikariCP: max=20, min-idle=5, timeout=30s |
| Query Optimization | Explain analyze on all queries > 100ms |
| Batch Operations | Bulk insert for attendance records, emulation entries |
| Pagination | Cursor-based for messages (keyset pagination), offset for others |
| Partitioning | `messages` by month, `notifications` by month |
| Indexing | Composite indexes on frequently filtered columns |
| Materialized Views | Emulation summaries, attendance stats |

### 17.3 WebSocket Scaling

- Redis Pub/Sub as message broker cho multi-instance WebSocket
- Sticky sessions via Traefik (consistent hashing on userId)
- Connection limit: max 5 concurrent WS per user
- Heartbeat: 25s interval, 60s timeout
- Message batching: group multiple updates within 100ms window

### 17.4 File Upload Optimization

- Chunked upload for files > 10MB
- Client-side compression for images before upload
- Presigned URL direct upload to MinIO (bypass API server)
- Async thumbnail generation via RabbitMQ worker
- CDN caching for frequently accessed shared documents

---

## 18. Error Handling & Logging

### 18.1 Error Code System

| Code Range | Module | Example |
|-----------|--------|---------|
| AUTH_001-099 | Authentication | AUTH_001: Invalid credentials |
| CLASS_001-099 | Classroom | CLASS_001: Classroom not found |
| GROUP_001-099 | Group/Emulation | GROUP_001: Not group leader |
| FUND_001-099 | Fund | FUND_001: Insufficient balance |
| DOC_001-099 | Documents | DOC_001: Storage quota exceeded |
| EVT_001-099 | Events | EVT_001: Event already ended |
| CHAT_001-099 | Chat | CHAT_001: Announcement mode active |
| ATT_001-099 | Attendance | ATT_001: QR code expired |
| PAR_001-099 | Parent | PAR_001: Link not approved |
| SYS_001-099 | System | SYS_001: Rate limit exceeded |

### 18.2 Logging Strategy

| Level | Usage | Destination |
|-------|-------|-------------|
| ERROR | Unhandled exceptions, external service failures | Loki + Alert (PagerDuty/Telegram) |
| WARN | Business rule violations, retries | Loki |
| INFO | API requests, state changes, scheduled jobs | Loki |
| DEBUG | Detailed flow (dev/staging only) | Loki (filtered) |

**Structured Logging Format (JSON):**
```json
{
  "timestamp": "2026-04-12T10:30:00.123+07:00",
  "level": "INFO",
  "logger": "FundService",
  "message": "Payment confirmed",
  "context": {
    "classroomId": "uuid",
    "fundId": "uuid",
    "memberId": "uuid",
    "amount": 50000,
    "method": "VIETQR",
    "traceId": "abc123"
  }
}
```

**Distributed Tracing:** Spring Cloud Sleuth / Micrometer Tracing → trace ID propagated across services and WebSocket.

### 18.3 Monitoring & Alerting

| Metric | Threshold | Alert |
|--------|-----------|-------|
| API P95 latency | > 500ms for 5 min | Warning |
| API P99 latency | > 2s for 2 min | Critical |
| Error rate | > 1% for 5 min | Critical |
| DB connection pool | > 80% utilized | Warning |
| Redis memory | > 80% | Warning |
| MinIO disk | > 85% | Critical |
| WebSocket connections | > 10,000 | Warning |
| RabbitMQ queue depth | > 1,000 for 5 min | Warning |

---

## 19. Migration & Data Strategy

### 19.1 Database Migration

- Tool: **Flyway** (Spring Boot integrated)
- Naming convention: `V{version}__{description}.sql`
- All migrations idempotent where possible
- Rollback scripts for critical migrations
- Zero-downtime migration strategy: additive changes first, then cleanup

### 19.2 Phased Rollout Plan

| Phase | Duration | Features |
|-------|----------|----------|
| **Phase 1 (MVP)** | 3 months | Auth, Classroom, Groups, Emulation (basic), Chat, Seating Chart, Attendance |
| **Phase 2** | 2 months | Fund Management, Events/Polls, Documents, Duty Roster, Parent Portal |
| **Phase 3** | 2 months | Reports/Analytics, Export, Timetable, Advanced Charts, Notification preferences |
| **Phase 4** | Ongoing | Achievement system, AI features, GPS attendance, Offline mode, Performance tuning |

### 19.3 Data Seeding (Development)

- Faker-based seed data generator
- 5 sample classrooms, 50 students each, 4 groups per class
- 3 months of emulation data, attendance records, chat messages
- Sample fund transactions and events

---

## 20. Appendix

### 20.1 Environment Variables

```properties
# Database
DB_URL=jdbc:postgresql://localhost:5432/classroomhub
DB_USERNAME=classroomhub
DB_PASSWORD=<secret>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<secret>

# MinIO
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=<secret>
MINIO_SECRET_KEY=<secret>

# JWT
JWT_PRIVATE_KEY_PATH=/keys/private.pem
JWT_PUBLIC_KEY_PATH=/keys/public.pem
JWT_ACCESS_TOKEN_TTL=900
JWT_REFRESH_TOKEN_TTL=2592000

# Firebase
FIREBASE_CREDENTIALS_PATH=/keys/firebase-sa.json

# AWS SES
AWS_SES_REGION=ap-southeast-1
AWS_SES_ACCESS_KEY=<secret>
AWS_SES_SECRET_KEY=<secret>
AWS_SES_FROM_EMAIL=noreply@classroomhub.app

# SePay
SEPAY_API_KEY=<secret>
SEPAY_WEBHOOK_SECRET=<secret>
SEPAY_BANK_ACCOUNT=<configured-per-classroom>

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=classroomhub
RABBITMQ_PASSWORD=<secret>

# App
APP_BASE_URL=https://classroomhub.app
APP_API_URL=https://api.classroomhub.app
```

### 20.2 Spring Boot Application Properties (Key Configs)

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    properties:
      hibernate:
        default_batch_fetch_size: 20
        order_inserts: true
        order_updates: true
        jdbc:
          batch_size: 50
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      max-lifetime: 600000
  data:
    redis:
      timeout: 5000
  rabbitmq:
    listener:
      simple:
        prefetch: 10
        concurrency: 3
        max-concurrency: 10
  servlet:
    multipart:
      max-file-size: 500MB
      max-request-size: 500MB

server:
  compression:
    enabled: true
    mime-types: application/json,text/html,text/plain
  http2:
    enabled: true
```

### 20.3 KMP Dependencies (Key Libraries)

```kotlin
// shared/build.gradle.kts
commonMain.dependencies {
    // Networking
    implementation("io.ktor:ktor-client-core:2.3.x")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.x")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.x")

    // Local Storage
    implementation("app.cash.sqldelight:runtime:2.0.x")
    implementation("androidx.datastore:datastore-preferences-core:1.1.x")

    // DI
    implementation("io.insert-koin:koin-core:3.5.x")

    // Image Loading
    implementation("io.coil-kt.coil3:coil-compose:3.x")

    // DateTime
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.x")

    // Navigation
    implementation("org.jetbrains.androidx.navigation:navigation-compose:2.7.x")

    // ViewModel
    implementation("org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-compose:2.8.x")
}

androidMain.dependencies {
    implementation("io.ktor:ktor-client-okhttp:2.3.x")
    implementation("com.google.firebase:firebase-messaging-ktx:24.x")
    implementation("app.cash.sqldelight:android-driver:2.0.x")
    // CameraX for QR scanning
    implementation("androidx.camera:camera-camera2:1.3.x")
    implementation("com.google.mlkit:barcode-scanning:17.x")
}

iosMain.dependencies {
    implementation("io.ktor:ktor-client-darwin:2.3.x")
    implementation("app.cash.sqldelight:native-driver:2.0.x")
}
```

### 20.4 Glossary of Abbreviations

| Abbreviation | Full Form |
|-------------|-----------|
| KMP | Kotlin Multiplatform |
| CMP | Compose Multiplatform |
| FCM | Firebase Cloud Messaging |
| STOMP | Simple Text Oriented Messaging Protocol |
| RBAC | Role-Based Access Control |
| QR | Quick Response (Code) |
| RSVP | Répondez s'il vous plaît |
| DM | Direct Message |
| OTP | One-Time Password |
| PII | Personally Identifiable Information |
| TTL | Time To Live |
| HA | High Availability |
| CDN | Content Delivery Network |
| TDE | Transparent Data Encryption |

---

> **Document End**
> ClassroomHub Detail Design Document v1.0.0
> Last updated: 2026-04-12
