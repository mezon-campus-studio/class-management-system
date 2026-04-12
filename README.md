# PHẦN MỀM QUẢN LÝ LỚP HỌC (Class Management System)
### Nhóm phát triển: J97CLUB

## 1. Tổng quan hệ thống
Hệ thống được xây dựng nhằm quản lý hiệu quả các hoạt động thường nhật trong lớp học – những nghiệp vụ mà các ứng dụng quản lý lớp hiện nay còn thiếu hoặc chưa hỗ trợ đầy đủ. Trọng tâm là số hóa quy trình vận hành lớp, đảm bảo minh bạch, thuận tiện và dễ theo dõi.

### Các chức năng chính:
- **Xác thực & Phân quyền:** Đăng nhập hệ thống hoặc bên thứ ba (Google, Mezon). Phân quyền Admin (Chủ lớp) và Member (Thành viên).
- **Quản lý lớp học:** Sơ đồ lớp, quản lý tổ, quản lý thành viên và cấp quyền.
- **Điểm danh:** Theo ngày/buổi, đồng bộ với đơn xin nghỉ phép.
- **Quản lý hoạt động & Điểm rèn luyện:** Thống kê chi tiết, trực quan.
- **Quản lý điểm thi đua:** Cộng/trừ điểm theo tổ, xếp hạng thi đua.
- **Quản lý quỹ lớp:** Minh bạch thu chi, hỗ trợ thanh toán qua mã QR (Phiên bản 2).
- **Quản lý nghỉ phép:** Gửi đơn, xét duyệt và tự động cập nhật trạng thái điểm danh.

---

## 2. Công nghệ sử dụng

### Backend
- **Ngôn ngữ:** Java 21
- **Framework:** Spring Boot 4.x
- **ORM:** Spring Data JPA (Hibernate)
- **Security:** Spring Security (JWT)
- **Database:** PostgreSQL (Host trên Supabase)
- **Công cụ hỗ trợ:** Lombok, MapStruct

### Frontend
- **Framework:** React.js 19
- **Build Tool:** Vite
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Quản lý Routing:** React Router DOM

---

## 3. Cấu trúc thư mục
```text
class-management-system/
├── backend/                # Nguồn mã nguồn Spring Boot
│   ├── src/main/java/...   # Logic xử lý nghiệp vụ
│   └── build.gradle.kts    # Cấu hình dependencies backend
├── frontend/               # Nguồn mã nguồn React
│   ├── src/                # Component, Page, Hook, Service
│   └── package.json        # Cấu hình dependencies frontend
└── README.md               # Tài liệu hướng dẫn dự án
```

---

## 4. Hướng dẫn cài đặt & Chạy thử

### Yêu cầu hệ thống
- JDK 21+
- Node.js 20+
- PostgreSQL (hoặc kết nối Supabase)

### Chạy Backend
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cấu hình cơ sở dữ liệu trong `src/main/resources/application.properties`.
3. Chạy ứng dụng:
   ```bash
   ./gradlew bootRun
   ```

### Chạy Frontend
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Chạy môi trường phát triển:
   ```bash
   npm run dev
   ```

---
