package com.classroomhub.domain.auth.dto;

import com.classroomhub.domain.auth.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email(message = "Email không hợp lệ")
        @NotBlank(message = "Email không được để trống")
        String email,

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
        String password,

        @NotBlank(message = "Tên hiển thị không được để trống")
        @Size(max = 100, message = "Tên hiển thị tối đa 100 ký tự")
        String displayName,

        @NotNull(message = "Loại tài khoản không được để trống")
        User.UserType userType,

        /** Bắt buộc khi userType = PARENT — mã định danh của học sinh (VD: STU-A4B9C2). */
        String studentCode,

        /** Tùy chọn cho PARENT: FATHER / MOTHER / GUARDIAN. */
        String relationship
) {}
