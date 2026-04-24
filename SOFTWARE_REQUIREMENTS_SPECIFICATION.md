Dưới đây là tài liệu đặc tả yêu cầu hệ thống (Software Requirements Specification - SRS) được chuyển đổi sang định dạng Markdown. Tài liệu này được cấu trúc lại để tối ưu cho việc đọc hiểu của AI Agent, giúp hỗ trợ quá trình viết code và triển khai dự án chính xác nhất.

---

# TÀI LIỆU ĐẶC TẢ HỆ THỐNG QUẢN LÝ LỚP HỌC
**Nhóm phát triển:** J97CLUB

## 1. TỔNG QUAN HỆ THỐNG
* **Mục tiêu:** Số hóa quy trình vận hành lớp học, tập trung vào các nghiệp vụ thực tế mà các ứng dụng hiện nay chưa hỗ trợ đầy đủ. Đảm bảo tính minh bạch, thuận tiện và dễ theo dõi.
* **Đối tượng sử dụng:** Giảng viên/Lớp trưởng (Admin) và Thành viên lớp (Member).

## 2. CÔNG NGHỆ SỬ DỤNG (TECH STACK)
* **Backend:** Java Spring Boot (Kiến trúc RESTful API).
* **Data Access:** Spring Data JPA, Hibernate.
* **Frontend:** React.js.
* **Database:** Supabase (PostgreSQL).
* **Xác thực:** JWT (JSON Web Token) kết hợp OAuth2 (Google, Mezon).

---

## 3. PHÂN QUYỀN NGƯỜI DÙNG (ROLES)
### 3.1. Phân cấp
* **Cấp hệ thống:** các user là như nhau
* **Cấp lớp học:**
    * **Admin:**
        * Người tạo lớp, sở hữu toàn quyền quản trị.
        * Cấu hình hệ thống, cấp quyền cho Member.
        * Kiểm soát và phê duyệt toàn bộ dữ liệu.
    * **Member:**
        * Thành viên trong lớp.
        * Thực hiện các chức năng trong phạm vi quyền hạn được Admin cấp.

### 3.2. Hệ thống phân role trong lớp
* mỗi **Member** trong lớp sẽ được sẽ được **Admin** trong lớp (là người tạo lớp hoặc được trao quyền)
---
* cách thức hoạt động khi phân quyền: các quyền sẽ được chia nhỏ và tùy người này sẽ có quyền này, người kia sẽ có quyền kia tùy vào **Admin** chia (tương tự hệ thống cấp quyền của `discord`)

## 4. DANH SÁCH CHỨC NĂNG CHI TIẾT

### 4.1. Xác thực và Bảo mật (Authentication & Authorization)
* **Đăng ký:** Tạo tài khoản mới bằng Username/Password.
* **Đăng nhập:**
    * Hệ thống nội bộ (Username/Password).
    * Dịch vụ bên thứ ba: Google, Mezon.
* **Đăng xuất:** Hủy phiên làm việc.
* **Phân quyền (RBAC):** Kiểm soát truy cập dựa trên vai trò sau khi đăng nhập thành công.

### 4.2. Quản lý Cấu trúc Lớp học
* **Quản lý Lớp (Class):**
    * CRUD lớp học (Tạo, sửa thông tin, xóa).
    * Thông tin lớp bao gồm: Tên lớp, ảnh đại diện, thông báo chung...
    * Dashboard xem danh sách các lớp đã tham gia/quản lý.
* **Quản lý Tổ (Team):**
    * Thêm/Xóa tổ trong lớp.
    * Xem danh sách các tổ.
* **Quản lý Thành viên (Member):**
    * Thêm/Xóa thành viên vào lớp.
    * Xem danh sách thành viên.
    * Cấp và điều chỉnh quyền chi tiết cho từng thành viên.

### 4.3. Quản lý Điểm danh (Attendance)
* **Khởi tạo:** Tạo phiên điểm danh theo ngày hoặc theo buổi học cụ thể.
* **Trạng thái điểm danh:**
    * `Có mặt`
    * `Vắng`
    * `Đi muộn`
    * `Có phép`
* **Cập nhật:** Chỉnh sửa thông tin điểm danh khi có sai sót.
* **Lịch sử:** Xem lịch sử điểm danh chi tiết của từng cá nhân.

### 4.4. Hoạt động & Điểm rèn luyện (Activities)
* **Quản lý hoạt động:** CRUD (Thêm, sửa, xóa) các hoạt động ngoại khóa/phong trào.
* **Phê duyệt:** Admin xét duyệt các hoạt động cần xác nhận.
* **Ghi nhận:** Điểm danh thành viên thực tế tham gia hoạt động.
* **Báo cáo:** Thống kê chi tiết và trực quan điểm rèn luyện của từng sinh viên.

### 4.5. Quản lý Điểm thi đua (Emulation Points)
* **Ghi nhận:** Cộng/Trừ điểm thi đua theo từng tổ.
* **Dữ liệu bao gồm:** Tên thành viên vi phạm/đóng góp, số điểm thay đổi, lý do.
* **Thống kê:** Tổng hợp điểm theo tổ để đánh giá và xếp hạng thi đua.

### 4.6. Quản lý Quỹ lớp (Class Fund)
*Hệ thống đảm bảo tính minh bạch, tất cả thành viên đều có thể theo dõi số dư và lịch sử thu/chi.*

* **Phiên bản 1 (Thủ công):**
    * **Admin:** Tạo đơn thanh toán (Số tiền, thông tin tài khoản nhận). Phê duyệt minh chứng.
    * **Member:** Gửi ảnh hóa đơn/minh chứng giao dịch sau khi chuyển khoản.
* **Phiên bản 2 (Tự động):**
    * **Admin:** Tạo đơn thanh toán tích hợp mã QR (Dynamic QR từ Payment API).
    * **Member:** Quét mã QR để thanh toán.
    * **Hệ thống:** Tự động xác nhận giao dịch qua Webhook/API và cập nhật trạng thái "Đã nộp".

### 4.7. Quản lý Nghỉ phép (Leave Request)
* **Member:**
    * Tạo đơn xin nghỉ (Chọn thời gian, lý do, đính kèm minh chứng/ảnh).
    * Theo dõi trạng thái đơn: `Chờ duyệt`, `Đã duyệt`, `Bị từ chối`.
* **Admin:**
    * Xem danh sách đơn từ tập trung.
    * Phê duyệt hoặc từ chối đơn xin nghỉ.
* **Logic đặc biệt:** Khi đơn được duyệt, hệ thống phải **tự động đồng bộ** trạng thái điểm danh ngày hôm đó thành `Có phép`.

---

## 5. YÊU CẦU DỮ LIỆU (DATABASE HINTS)
* **Tables dự kiến:** `Users`, `Classes`, `Teams`, `Memberships`, `Attendance`, `Activities`, `ActivityParticipants`, `EmulationLogs`, `Transactions` (Quỹ), `LeaveRequests`.
* **Mối quan hệ:** Một lớp có nhiều tổ, một tổ có nhiều thành viên. Một phiên điểm danh liên kết với nhiều bản ghi trạng thái của thành viên.

---
*Tài liệu này được soạn thảo để làm kim chỉ nam cho quá trình phát triển (Development) và kiểm thử (Testing).*