package com.classroomhub.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // Auth
    EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", "Email đã được sử dụng", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),
    STUDENT_CODE_REQUIRED("STUDENT_CODE_REQUIRED", "Phụ huynh cần nhập mã học sinh để đăng ký", HttpStatus.BAD_REQUEST),
    STUDENT_NOT_FOUND("STUDENT_NOT_FOUND", "Không tìm thấy học sinh với mã này", HttpStatus.NOT_FOUND),
    PARENT_CANNOT_JOIN_CLASSROOM("PARENT_CANNOT_JOIN_CLASSROOM", "Phụ huynh không thể tự tham gia lớp — lớp được tự động liên kết qua con của bạn", HttpStatus.FORBIDDEN),
    PARENT_LINK_NOT_FOUND("PARENT_LINK_NOT_FOUND", "Không tìm thấy liên kết phụ huynh-học sinh", HttpStatus.NOT_FOUND),
    INVALID_TOKEN("INVALID_TOKEN", "Token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    RESET_OTP_INVALID("RESET_OTP_INVALID", "Mã OTP không đúng hoặc đã được sử dụng", HttpStatus.BAD_REQUEST),
    RESET_OTP_EXPIRED("RESET_OTP_EXPIRED", "Mã OTP đã hết hạn, vui lòng yêu cầu mã mới", HttpStatus.BAD_REQUEST),
    TOKEN_REUSE_DETECTED("TOKEN_REUSE_DETECTED", "Phát hiện sử dụng token bất hợp pháp, tất cả phiên đăng nhập đã bị thu hồi", HttpStatus.UNAUTHORIZED),
    REFRESH_LIMIT_EXCEEDED("REFRESH_LIMIT_EXCEEDED", "Phiên đăng nhập đã đạt giới hạn làm mới, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED),
    ACCOUNT_INACTIVE("ACCOUNT_INACTIVE", "Tài khoản không hoạt động", HttpStatus.FORBIDDEN),

    // Classroom
    CLASSROOM_NOT_FOUND("CLASSROOM_NOT_FOUND", "Không tìm thấy lớp học", HttpStatus.NOT_FOUND),
    INVITE_CODE_INVALID("INVITE_CODE_INVALID", "Mã mời không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    ALREADY_MEMBER("ALREADY_MEMBER", "Bạn đã là thành viên của lớp học này", HttpStatus.CONFLICT),
    CLASSROOM_FULL("CLASSROOM_FULL", "Lớp học đã đạt giới hạn thành viên", HttpStatus.CONFLICT),
    NOT_CLASSROOM_MEMBER("NOT_CLASSROOM_MEMBER", "Bạn không phải thành viên của lớp học này", HttpStatus.FORBIDDEN),
    MEMBER_NOT_FOUND("MEMBER_NOT_FOUND", "Không tìm thấy thành viên", HttpStatus.NOT_FOUND),

    // Group
    GROUP_NOT_FOUND("GROUP_NOT_FOUND", "Không tìm thấy tổ", HttpStatus.NOT_FOUND),
    MEMBER_ALREADY_IN_GROUP("MEMBER_ALREADY_IN_GROUP", "Thành viên đã thuộc một tổ khác", HttpStatus.CONFLICT),

    // Attendance
    SESSION_NOT_FOUND("SESSION_NOT_FOUND", "Không tìm thấy phiên điểm danh", HttpStatus.NOT_FOUND),
    SESSION_NOT_STARTED("SESSION_NOT_STARTED", "Phiên điểm danh chưa bắt đầu", HttpStatus.BAD_REQUEST),
    SESSION_CLOSED("SESSION_CLOSED", "Phiên điểm danh đã đóng", HttpStatus.BAD_REQUEST),
    SESSION_EXPIRED("SESSION_EXPIRED", "Phiên điểm danh đã quá hạn", HttpStatus.BAD_REQUEST),
    RECORD_NOT_FOUND("RECORD_NOT_FOUND", "Không tìm thấy bản ghi điểm danh", HttpStatus.NOT_FOUND),
    ALREADY_CHECKED_IN("ALREADY_CHECKED_IN", "Bạn đã điểm danh cho phiên này", HttpStatus.CONFLICT),
    CANNOT_APPROVE("CANNOT_APPROVE", "Bạn không có quyền duyệt điểm danh này", HttpStatus.FORBIDDEN),
    RECORD_NOT_PENDING("RECORD_NOT_PENDING", "Bản ghi không ở trạng thái chờ duyệt", HttpStatus.BAD_REQUEST),

    // Emulation
    EMULATION_CATEGORY_NOT_FOUND("EMULATION_CATEGORY_NOT_FOUND", "Không tìm thấy hạng mục thi đua", HttpStatus.NOT_FOUND),
    EMULATION_ENTRY_NOT_FOUND("EMULATION_ENTRY_NOT_FOUND", "Không tìm thấy bản ghi thi đua", HttpStatus.NOT_FOUND),

    // Duty
    DUTY_TYPE_NOT_FOUND("DUTY_TYPE_NOT_FOUND", "Không tìm thấy loại trực nhật", HttpStatus.NOT_FOUND),
    DUTY_ASSIGNMENT_NOT_FOUND("DUTY_ASSIGNMENT_NOT_FOUND", "Không tìm thấy phân công trực nhật", HttpStatus.NOT_FOUND),
    DUTY_ALREADY_COMPLETED("DUTY_ALREADY_COMPLETED", "Nhiệm vụ này đã được xác nhận", HttpStatus.BAD_REQUEST),

    // Document
    FOLDER_NOT_FOUND("FOLDER_NOT_FOUND", "Không tìm thấy thư mục", HttpStatus.NOT_FOUND),
    DOCUMENT_NOT_FOUND("DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu", HttpStatus.NOT_FOUND),
    UPLOAD_FAILED("UPLOAD_FAILED", "Tải lên tài liệu thất bại", HttpStatus.INTERNAL_SERVER_ERROR),

    // Fund
    FUND_NOT_FOUND("FUND_NOT_FOUND", "Không tìm thấy quỹ", HttpStatus.NOT_FOUND),
    COLLECTION_NOT_FOUND("COLLECTION_NOT_FOUND", "Không tìm thấy đợt thu", HttpStatus.NOT_FOUND),
    PAYMENT_NOT_FOUND("PAYMENT_NOT_FOUND", "Không tìm thấy bản ghi thanh toán", HttpStatus.NOT_FOUND),
    PAYMENT_ALREADY_CONFIRMED("PAYMENT_ALREADY_CONFIRMED", "Khoản thu này đã được xác nhận", HttpStatus.CONFLICT),
    EXPENSE_NOT_FOUND("EXPENSE_NOT_FOUND", "Không tìm thấy khoản chi", HttpStatus.NOT_FOUND),

    // Event
    EVENT_NOT_FOUND("EVENT_NOT_FOUND", "Không tìm thấy sự kiện", HttpStatus.NOT_FOUND),
    RSVP_ALREADY_EXISTS("RSVP_ALREADY_EXISTS", "Bạn đã phản hồi sự kiện này", HttpStatus.CONFLICT),
    ABSENCE_REQUEST_NOT_FOUND("ABSENCE_REQUEST_NOT_FOUND", "Không tìm thấy đơn xin vắng", HttpStatus.NOT_FOUND),
    ABSENCE_REQUEST_NOT_PENDING("ABSENCE_REQUEST_NOT_PENDING", "Đơn xin vắng không ở trạng thái chờ duyệt", HttpStatus.BAD_REQUEST),
    POLL_NOT_FOUND("POLL_NOT_FOUND", "Không tìm thấy bình chọn", HttpStatus.NOT_FOUND),
    POLL_CLOSED("POLL_CLOSED", "Bình chọn đã kết thúc", HttpStatus.BAD_REQUEST),
    ALREADY_VOTED("ALREADY_VOTED", "Bạn đã bình chọn rồi", HttpStatus.CONFLICT),

    // Chat
    CONVERSATION_NOT_FOUND("CONVERSATION_NOT_FOUND", "Không tìm thấy cuộc trò chuyện", HttpStatus.NOT_FOUND),
    MESSAGE_NOT_FOUND("MESSAGE_NOT_FOUND", "Không tìm thấy tin nhắn", HttpStatus.NOT_FOUND),

    // Notification
    NOTIFICATION_NOT_FOUND("NOTIFICATION_NOT_FOUND", "Không tìm thấy thông báo", HttpStatus.NOT_FOUND),

    // Timetable
    SUBJECT_NOT_FOUND("SUBJECT_NOT_FOUND", "Không tìm thấy môn học", HttpStatus.NOT_FOUND),
    SUBJECT_CODE_EXISTS("SUBJECT_CODE_EXISTS", "Mã môn học đã tồn tại", HttpStatus.CONFLICT),
    TEACHER_SUBJECT_NOT_FOUND("TEACHER_SUBJECT_NOT_FOUND", "Không tìm thấy phân công môn học", HttpStatus.NOT_FOUND),
    TEACHER_SUBJECT_EXISTS("TEACHER_SUBJECT_EXISTS", "Giáo viên đã được phân công môn học này", HttpStatus.CONFLICT),
    TIMETABLE_ENTRY_NOT_FOUND("TIMETABLE_ENTRY_NOT_FOUND", "Không tìm thấy tiết học", HttpStatus.NOT_FOUND),
    TIMETABLE_CLASSROOM_CONFLICT("TIMETABLE_CLASSROOM_CONFLICT", "Lớp học đã có tiết học vào thời điểm này", HttpStatus.CONFLICT),
    TIMETABLE_TEACHER_CONFLICT("TIMETABLE_TEACHER_CONFLICT", "Giáo viên đã có tiết dạy vào thời điểm này", HttpStatus.CONFLICT),
    SWAP_REQUEST_NOT_FOUND("SWAP_REQUEST_NOT_FOUND", "Không tìm thấy yêu cầu đổi lịch", HttpStatus.NOT_FOUND),
    SWAP_NOT_PENDING("SWAP_NOT_PENDING", "Yêu cầu đổi lịch không ở trạng thái chờ xử lý", HttpStatus.BAD_REQUEST),
    SWAP_ALREADY_PENDING("SWAP_ALREADY_PENDING", "Tiết học này đã có yêu cầu đổi lịch đang chờ", HttpStatus.CONFLICT),

    // General
    FORBIDDEN("FORBIDDEN", "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN),
    VALIDATION_ERROR("VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),
    INTERNAL_ERROR("INTERNAL_ERROR", "Lỗi hệ thống, vui lòng thử lại", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
