# ClassroomHub — Hướng dẫn sử dụng

> Phiên bản tài liệu: 1.0 · Cập nhật: 2026-04-28

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Đăng ký & Đăng nhập](#2-đăng-ký--đăng-nhập)
3. [Quản lý lớp học](#3-quản-lý-lớp-học)
4. [Thời khoá biểu](#4-thời-khoá-biểu)
5. [Điểm danh](#5-điểm-danh)
6. [Thi đua](#6-thi-đua)
7. [Trực nhật](#7-trực-nhật)
8. [Quỹ lớp](#8-quỹ-lớp)
9. [Tài liệu](#9-tài-liệu)
10. [Sự kiện & Bình chọn](#10-sự-kiện--bình-chọn)
11. [Chat](#11-chat)
12. [Sơ đồ chỗ ngồi](#12-sơ-đồ-chỗ-ngồi)
13. [Đánh giá học sinh](#13-đánh-giá-học-sinh)
14. [Thông báo](#14-thông-báo)
15. [Cổng phụ huynh](#15-cổng-phụ-huynh)
16. [Quản trị hệ thống (Admin)](#16-quản-trị-hệ-thống-admin)
17. [Phân quyền](#17-phân-quyền)

---

## 1. Tổng quan

ClassroomHub là nền tảng quản lý lớp học toàn diện dành cho:

- **Học sinh / Sinh viên** — điểm danh, xem lịch học, chat, tham gia sự kiện, theo dõi điểm thi đua
- **Giáo viên / Giảng viên** — quản lý lớp, xếp thời khoá biểu, duyệt điểm danh, đánh giá học sinh
- **Lớp trưởng / Ban cán sự** — quản lý quỹ lớp, phân công trực nhật, tổ chức sự kiện
- **Phụ huynh** — theo dõi tình hình học tập, xin phép vắng học cho con
- **Quản trị viên** — giám sát hệ thống, quản lý người dùng

### Giao diện

Ứng dụng web tại `http://localhost:5173` (dev) gồm:
- **Topbar** — logo, tìm kiếm, thông báo, avatar người dùng
- **Sidebar** — menu điều hướng (luôn hiển thị menu Thời khoá biểu; hiển thị menu lớp khi trong classroom)
- **Nội dung chính** — trang hiện tại

---

## 2. Đăng ký & Đăng nhập

### Đăng ký

1. Truy cập trang đăng ký (`/register`).
2. Nhập **Email**, **Tên hiển thị** và **Mật khẩu** (tối thiểu 8 ký tự).
3. Chọn **Loại tài khoản**: Học sinh/Sinh viên hoặc Giáo viên/Giảng viên.
4. Nhấn **Đăng ký**.

### Đăng nhập

1. Nhập email và mật khẩu.
2. Nhấn **Đăng nhập**.
3. Hệ thống cấp **access token** (hiệu lực 15 phút) và **refresh token** (30 ngày).
4. Access token được tự động làm mới nền — người dùng không cần đăng nhập lại trong vòng 30 ngày.

### Quên mật khẩu

1. Nhấn **Quên mật khẩu** trên trang đăng nhập.
2. Nhập email đã đăng ký → nhấn **Gửi email đặt lại**.
3. Kiểm tra hộp thư → nhấn link trong email (link có hiệu lực trong thời gian giới hạn).
4. Nhập mật khẩu mới → xác nhận.

### Cập nhật hồ sơ

1. Nhấn avatar ở góc trên phải → **Hồ sơ của tôi**.
2. Có thể thay đổi **Tên hiển thị** và **URL ảnh đại diện**.
3. Nhấn **Lưu**.

---

## 3. Quản lý lớp học

### Tạo lớp (Giáo viên / Owner)

1. Từ trang chủ, nhấn **Tạo lớp mới**.
2. Nhập tên lớp và mô tả (tùy chọn).
3. Nhấn **Tạo** → lớp được tạo, bạn là **OWNER**.

### Tham gia lớp (Học sinh / thành viên)

1. Từ trang chủ, nhấn **Tham gia lớp**.
2. Nhập **mã mời** được giáo viên / lớp trưởng cung cấp.
3. Nhấn **Tham gia** → bạn trở thành **MEMBER** của lớp.

### Quản lý mã mời

- Từ trang lớp → **Cài đặt lớp** → xem mã mời hiện tại.
- Nhấn **Tái tạo mã mời** nếu muốn vô hiệu hoá mã cũ.

### Quản lý thành viên (Teacher / Owner)

1. Vào trang lớp → tab **Thành viên** (hoặc menu Học sinh).
2. Xem danh sách tất cả thành viên kèm vai trò.
3. Nhấn **⋯** bên cạnh thành viên để:
   - **Đổi vai trò** (MEMBER → GROUP_LEADER / TREASURER / VICE_MONITOR / MONITOR / TEACHER)
   - **Xóa khỏi lớp**

### Phân tổ (Groups)

1. Vào trang lớp → **Quản lý tổ**.
2. Nhấn **Tạo tổ** → nhập tên, chọn màu, chỉ định tổ trưởng (tùy chọn).
3. Thêm thành viên vào tổ bằng cách kéo thả hoặc chọn từ danh sách.

### Rời lớp

- Vào trang lớp → **Cài đặt** → **Rời lớp**.
- Nếu là OWNER: phải chuyển quyền OWNER cho người khác trước khi rời.

---

## 4. Thời khoá biểu

### Xem thời khoá biểu

- Sidebar → **Thời khoá biểu** (luôn hiển thị bất kể route).
- Học sinh thấy **Thời khoá biểu lớp** của các lớp đã tham gia.
- Giáo viên thấy **Lịch dạy** (các tiết mình được phân công).

### Quản lý môn học (Teacher / Owner)

1. Vào **Thời khoá biểu** → tab **Môn học**.
2. Nhấn **Thêm môn** → nhập tên môn, mã môn (tùy chọn).
3. Phân công giáo viên dạy môn: nhấn **Phân công giáo viên** → chọn giáo viên.

### Tạo tiết học thủ công

1. Tab **Thời khoá biểu** → **Thêm tiết**.
2. Chọn: lớp, môn học, giáo viên, thứ trong tuần, số tiết (1–10), năm học, học kỳ.
3. Nhấn **Lưu** → tiết học được tạo, đồng thời **tự động tạo các phiên điểm danh** cho 14 ngày tới.

### Xếp lịch tự động

1. Tab **Xếp lịch** → chọn cấu hình (hoặc tạo cấu hình mới).
2. Cấu hình gồm: danh sách lớp, môn học, ràng buộc tiết/ngày.
3. Nhấn **Tự động xếp lịch** → hệ thống tìm phân công tối ưu không xung đột.
4. Xem trước kết quả → nhấn **Xác nhận** để lưu.

### Đổi tiết (Giáo viên)

1. Từ lịch dạy của mình → nhấn **Yêu cầu đổi tiết** trên một tiết bất kỳ.
2. Chọn tiết muốn đổi sang, chọn giáo viên thay thế (tùy chọn), nhập ghi chú.
3. Nhấn **Gửi yêu cầu**.
4. Yêu cầu được duyệt/từ chối bởi OWNER hoặc TEACHER có quyền quản lý.

---

## 5. Điểm danh

> Xem chi tiết: [`ATTENDANCE_FLOW.md`](ATTENDANCE_FLOW.md)

### Cách điểm danh hoạt động

ClassroomHub sử dụng mô hình điểm danh **tự động dựa trên thời khoá biểu**:

1. Khi tạo/cập nhật thời khoá biểu → hệ thống **tự động tạo phiên điểm danh** cho 14 ngày tới.
2. Mỗi phiên có 3 trạng thái: `SCHEDULED` → `OPEN` → `CLOSED`.
3. Phiên tự động chuyển sang `OPEN` khi đến giờ tiết học.
4. Phiên tự động `CLOSED` sau 30 phút kể từ khi tiết bắt đầu.

### Học sinh: Tự điểm danh

1. Sidebar → **Điểm danh**.
2. Chọn **phiên đang mở** (badge xanh `Đang mở`).
3. Nhấn **Điểm danh ngay** → bản ghi được ghi nhận với trạng thái `PRESENT`.

> Nếu phiên đang ở trạng thái `Chưa bắt đầu` (badge vàng) — tiết học chưa đến giờ, chờ đến giờ mới điểm danh được.

### Giáo viên: Xem và duyệt điểm danh

1. Sidebar → **Điểm danh** → chọn phiên.
2. Xem danh sách học sinh + trạng thái (Có mặt / Vắng / Đi muộn / Có phép).
3. Nhấn vào bản ghi → chọn trạng thái mới → nhập ghi chú → **Lưu**.

### Tạo phiên điểm danh thủ công (Teacher)

1. Tab **Điểm danh** → **Tạo phiên mới**.
2. Nhập tiêu đề, chọn môn học (tùy chọn), ngày, tiết.
3. Nhấn **Tạo** → phiên được tạo ở trạng thái `OPEN` ngay lập tức.

### Đóng phiên thủ công (Teacher)

- Nhấn **Đóng phiên** trong trang chi tiết phiên.
- Sau khi đóng, không ai điểm danh được nữa.

### Trạng thái phiên điểm danh

| Trạng thái | Màu badge | Ý nghĩa |
|---|---|---|
| `SCHEDULED` | Vàng | Đã lên lịch, chưa đến giờ |
| `OPEN` | Xanh lá | Đang mở, học sinh có thể điểm danh |
| `CLOSED` | Xám | Đã đóng, không thể điểm danh thêm |

### Trạng thái bản ghi điểm danh

| Trạng thái | Ý nghĩa |
|---|---|
| `PRESENT` | Có mặt |
| `ABSENT` | Vắng không phép |
| `LATE` | Đi muộn |
| `EXCUSED` | Vắng có phép |

---

## 6. Thi đua

Module thi đua giúp theo dõi và đánh giá hành vi, nỗ lực của từng thành viên trong lớp.

### Quản lý hạng mục (Teacher / Monitor)

1. Sidebar → **Thi đua** → tab **Hạng mục**.
2. Nhấn **Thêm hạng mục** → nhập tên (VD: "Điểm chuyên cần", "Vi phạm nội quy", "Đóng góp tích cực").
3. Có thể gán điểm dương hoặc âm cho mỗi hạng mục.

### Ghi điểm (Group Leader / Teacher)

1. Tab **Ghi điểm** → chọn thành viên → chọn hạng mục → nhập số điểm → ghi chú (tùy chọn).
2. Nhấn **Lưu** → điểm được cập nhật vào bảng xếp hạng ngay.

### Xem bảng xếp hạng

- Tab **Bảng xếp hạng** → tổng điểm từng thành viên, xếp theo thứ tự giảm dần.
- Có thể lọc theo tổ hoặc theo thời gian.

---

## 7. Trực nhật

Module quản lý lịch phân công trực nhật (vệ sinh, sắp xếp lớp học, v.v.)

### Quản lý loại trực nhật (Teacher)

1. Sidebar → **Trực nhật** → tab **Loại trực nhật**.
2. Nhấn **Thêm loại** → nhập tên (VD: "Lau bảng", "Quét nhà", "Tưới cây").

### Phân công (Teacher / Monitor)

1. Tab **Phân công** → chọn ngày → **Thêm phân công**.
2. Chọn loại trực nhật, chọn thành viên hoặc tổ được phân công.
3. Nhấn **Lưu**.

### Xác nhận hoàn thành (Học sinh)

1. Tab **Của tôi** → xem lịch trực nhật được giao.
2. Sau khi hoàn thành → nhấn **Xác nhận hoàn thành**.

### Lọc theo ngày

- Nhấn vào ô lịch để xem phân công của ngày bất kỳ.
- Dùng mũi tên để chuyển tuần.

---

## 8. Quỹ lớp

Module quản lý thu-chi quỹ lớp, hỗ trợ thanh toán online qua VNPay và MoMo.

### Khởi tạo quỹ (Treasurer / Owner)

1. Sidebar → **Quỹ lớp** → nhấn **Khởi tạo quỹ**.
2. Nhập thông tin tài khoản ngân hàng của lớp (tùy chọn, dùng cho chuyển khoản thủ công).

### Tạo đợt thu

1. Tab **Đợt thu** → **Tạo đợt thu mới**.
2. Nhập tên đợt, số tiền mỗi người, hạn nộp, mô tả.
3. Nhấn **Tạo** → tất cả thành viên xuất hiện trong danh sách cần thanh toán.

### Ghi nhận thanh toán thủ công (Treasurer)

1. Trong đợt thu → nhấn **Ghi nhận** bên cạnh tên thành viên.
2. Nhập số tiền, phương thức, ghi chú.
3. Nhấn **Xác nhận thu**.

### Thanh toán online (Học sinh)

1. Tab **Của tôi** → xem các đợt thu chưa nộp.
2. Nhấn **Thanh toán** → chọn phương thức (VNPay / MoMo).
3. Chuyển hướng đến cổng thanh toán → hoàn tất.
4. Hệ thống tự động xác nhận sau khi callback từ cổng thanh toán.

### Ghi khoản chi

1. Tab **Khoản chi** → **Thêm khoản chi**.
2. Nhập tên khoản, số tiền, ngày, mô tả.
3. Nhấn **Lưu** → số tiền tự động trừ vào số dư quỹ.

### Xem tổng kết

- Tab **Tổng kết** → xem: tổng đã thu, tổng chi, số dư hiện tại.

---

## 9. Tài liệu

Module lưu trữ và chia sẻ tài liệu của lớp với cấu trúc thư mục.

### Tạo thư mục

1. Sidebar → **Tài liệu** → nhấn **Thư mục mới**.
2. Nhập tên thư mục → **Tạo**.
3. Có thể tạo thư mục lồng nhau bằng cách vào trong thư mục rồi tạo tiếp.

### Upload tài liệu

1. Vào thư mục muốn upload → nhấn **Upload** hoặc kéo thả file vào vùng upload.
2. Giới hạn: **tối đa 20MB mỗi file**.
3. Các định dạng hỗ trợ: PDF, Word, Excel, PowerPoint, ảnh, video, v.v.

### Tải xuống

- Nhấn vào tên file → **Tải xuống**.

### Xóa tài liệu / thư mục

- Nhấn **⋯** bên cạnh file/thư mục → **Xóa**.
- Chỉ Teacher / Owner mới xóa được tài liệu người khác.

---

## 10. Sự kiện & Bình chọn

### Tạo sự kiện (Monitor / Teacher / Owner)

1. Sidebar → **Sự kiện** → **Tạo sự kiện**.
2. Nhập tên, mô tả, ngày bắt đầu, ngày kết thúc, địa điểm (tùy chọn).
3. Nhấn **Tạo**.

### Phản hồi tham dự (Học sinh)

- Trong chi tiết sự kiện → nhấn **Tham gia** / **Không tham gia** / **Có thể**.

### Xin phép vắng học

1. Tab **Đơn xin vắng** → **Tạo đơn**.
2. Nhập lý do, ngày vắng, đính kèm giấy phép (tùy chọn).
3. Nhấn **Gửi đơn** → đơn gửi đến giáo viên duyệt.

### Duyệt đơn vắng (Teacher / Monitor)

- Tab **Đơn chờ duyệt** → nhấn **Duyệt** hoặc **Từ chối** → nhập ghi chú lý do.

### Tạo bình chọn (Monitor / Teacher)

1. Tab **Bình chọn** → **Tạo bình chọn**.
2. Nhập câu hỏi, thêm các lựa chọn.
3. Tùy chọn: cho phép chọn nhiều, ẩn kết quả cho đến khi kết thúc.
4. Nhấn **Tạo** → thành viên nhận thông báo.

### Bỏ phiếu (Học sinh)

- Vào bình chọn → chọn đáp án → nhấn **Bỏ phiếu**.

---

## 11. Chat

Module chat thời gian thực trong lớp, hỗ trợ text, ảnh, file và reaction emoji.

### Giao diện

- Sidebar → **Trò chuyện**.
- Mỗi lớp có một **hội thoại chung** (class conversation) và có thể có thêm các hội thoại nhóm.

### Gửi tin nhắn

1. Nhập tin nhắn vào ô văn bản ở cuối màn hình.
2. Nhấn **Enter** hoặc nút **Gửi**.

### Gửi ảnh / file

1. Nhấn biểu tượng **đính kèm** (📎) trong ô tin nhắn.
2. Chọn file từ máy tính (ảnh, PDF, v.v.).
3. Nhấn **Gửi**.

### Reaction emoji

- Di chuột vào tin nhắn → nhấn biểu tượng emoji ở góc tin nhắn.
- Chọn emoji muốn thả.
- Nhấn lại vào reaction đang hiển thị để bỏ reaction.
- **Shift + Click** hoặc **chuột phải** vào reaction để xem danh sách ai đã thả.

### Ghim tin nhắn

- Di chuột vào tin nhắn → nhấn **⋯** → **Ghim tin nhắn**.
- Xem tất cả tin nhắn đã ghim qua nút **Ghim** ở đầu khung chat.

### Xóa tin nhắn

- Di chuột vào tin nhắn của mình → **⋯** → **Xóa**.
- Teacher / Owner có thể xóa tin nhắn của người khác.

### Real-time

- Tin nhắn mới xuất hiện ngay lập tức qua WebSocket (không cần refresh).
- Khi mất kết nối, ứng dụng tự động thử kết nối lại (SockJS fallback).

---

## 12. Sơ đồ chỗ ngồi

Module thiết kế và quản lý sơ đồ vị trí ngồi trong lớp học.

### Xem sơ đồ

- Sidebar → **Sơ đồ lớp**.
- Hiển thị lưới ghế kèm tên học sinh được phân công.

### Chỉnh sửa (Teacher / Owner)

1. Nhấn **Chỉnh sửa sơ đồ**.
2. Kéo thả tên học sinh vào vị trí ghế tương ứng.
3. Có thể thêm, xóa, di chuyển ghế.
4. Nhấn **Lưu sơ đồ**.

---

## 13. Đánh giá học sinh

Module cho giáo viên ghi lại các đánh giá định tính về từng học sinh.

### Tạo đánh giá (Teacher)

1. Sidebar → **Học sinh** → chọn học sinh.
2. Nhấn **Thêm đánh giá**.
3. Nhập nội dung đánh giá, chọn loại (tích cực / cần cải thiện / trung lập).
4. Nhấn **Lưu**.

### Xem đánh giá của một học sinh

- Vào trang chi tiết học sinh → tab **Đánh giá** → xem toàn bộ lịch sử.

### Xóa đánh giá

- Nhấn **⋯** bên cạnh đánh giá → **Xóa**.

---

## 14. Thông báo

### Xem thông báo

- Nhấn **biểu tượng chuông** ở Topbar (hiển thị số chưa đọc).
- Danh sách thông báo xuất hiện theo thứ tự mới nhất.

### Đánh dấu đã đọc

- Nhấn vào thông báo → tự động đánh dấu đã đọc.
- Nhấn **Đánh dấu tất cả đã đọc** để xóa badge chuông.

### Cài đặt thông báo

- Vào **Hồ sơ** → **Cài đặt thông báo**.
- Bật/tắt thông báo theo từng loại (điểm danh, sự kiện, quỹ lớp, v.v.).

---

## 15. Cổng phụ huynh

Phụ huynh có tài khoản riêng với loại `PARENT` để theo dõi tình hình học tập của con.

### Liên kết tài khoản con

1. Đăng nhập tài khoản phụ huynh.
2. Vào **Quản lý con em** → **Liên kết tài khoản con**.
3. Nhập email tài khoản của con → nhấn **Liên kết**.

### Xem thông tin lớp học của con

- Tab **Lớp học** → chọn con → chọn lớp.
- Xem: tên lớp, danh sách thành viên, thời khoá biểu.

### Xem đánh giá của con

- Tab **Đánh giá** → xem toàn bộ đánh giá từ giáo viên.

### Xin phép vắng học cho con

1. Tab **Đơn xin vắng** → **Tạo đơn**.
2. Chọn con, nhập lý do, ngày vắng.
3. Nhấn **Gửi đơn** → giáo viên nhận và duyệt.

---

## 16. Quản trị hệ thống (Admin)

Chỉ dành cho tài khoản `ADMIN` (tạo tự động khi khởi động lần đầu hoặc cấu hình qua `AdminBootstrap`).

### Metrics hệ thống

- **Admin Dashboard** → xem tổng số user, lớp học, phiên điểm danh, v.v.

### Quản lý người dùng

1. Tab **Người dùng** → danh sách tất cả tài khoản.
2. Tìm kiếm theo email hoặc tên.
3. Nhấn **Khoá tài khoản** để tạm dừng quyền truy cập.
4. Nhấn **Mở khoá** để khôi phục.

### Quản lý lớp học

1. Tab **Lớp học** → danh sách tất cả lớp trong hệ thống.
2. Nhấn **Lưu trữ** để archive một lớp (lớp không còn hoạt động, dữ liệu được giữ lại).

---

## 17. Phân quyền

### Các vai trò trong lớp

| Vai trò | Mô tả |
|---|---|
| `MEMBER` | Học sinh / thành viên thông thường |
| `GROUP_LEADER` | Tổ trưởng — quản lý tổ, ghi điểm thi đua |
| `TREASURER` | Thủ quỹ — quản lý quỹ lớp, xác nhận thu tiền |
| `VICE_MONITOR` | Lớp phó |
| `MONITOR` | Lớp trưởng — tạo sự kiện, duyệt đơn vắng |
| `TEACHER` | Giáo viên — quản lý lớp, điểm danh, đánh giá |
| `OWNER` | Chủ lớp — toàn quyền kể cả phân quyền thành viên |

### Bảng quyền chi tiết

| Hành động | MEMBER | GROUP_LEADER | TREASURER | MONITOR | TEACHER | OWNER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Xem dữ liệu lớp | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tự điểm danh | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Xác nhận trực nhật | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bỏ phiếu, RSVP sự kiện | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ghi điểm thi đua | — | ✓ | — | ✓ | ✓ | ✓ |
| Phân công trực nhật | — | ✓ | — | ✓ | ✓ | ✓ |
| Quản lý quỹ, thu tiền | — | — | ✓ | — | ✓ | ✓ |
| Tạo sự kiện | — | — | — | ✓ | ✓ | ✓ |
| Duyệt đơn vắng | — | — | — | ✓ | ✓ | ✓ |
| Tạo / đóng phiên điểm danh | — | — | — | — | ✓ | ✓ |
| Duyệt bản ghi điểm danh | — | — | — | — | ✓ | ✓ |
| Quản lý thời khoá biểu | — | — | — | — | ✓ | ✓ |
| Upload / xóa tài liệu | — | — | — | — | ✓ | ✓ |
| Đánh giá học sinh | — | — | — | — | ✓ | ✓ |
| Xem danh sách học sinh | — | — | — | — | ✓ | ✓ |
| Phân quyền thành viên | — | — | — | — | — | ✓ |
| Xóa lớp / Archive | — | — | — | — | — | ✓ |

### Loại tài khoản hệ thống

| Loại | Mô tả |
|---|---|
| `STUDENT` | Học sinh / sinh viên |
| `TEACHER` | Giáo viên / giảng viên |
| `PARENT` | Phụ huynh |
| `ADMIN` | Quản trị viên hệ thống |
