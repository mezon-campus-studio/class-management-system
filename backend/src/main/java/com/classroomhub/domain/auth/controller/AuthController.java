package com.classroomhub.domain.auth.controller;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.auth.dto.AuthResponse;
import com.classroomhub.domain.auth.dto.ForgotPasswordRequest;
import com.classroomhub.domain.auth.dto.LoginRequest;
import com.classroomhub.domain.auth.dto.RegisterRequest;
import com.classroomhub.domain.auth.dto.ResetPasswordRequest;
import com.classroomhub.domain.auth.dto.UpdateProfileRequest;
import com.classroomhub.domain.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";
    private static final String CLIENT_ID_HEADER = "X-Client-Id";

    private final AuthService authService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.jwt.refresh-token-expiry}")
    private long refreshTokenExpiryMs;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> register(
            @Valid @RequestBody RegisterRequest req,
            @RequestHeader(value = CLIENT_ID_HEADER, required = false) String clientId,
            HttpServletResponse response) {
        AuthResponse auth = authService.register(req, clientId);
        setRefreshCookie(response, auth.refreshToken());
        return ApiResponse.ok(auth.withoutRefreshToken(), "Đăng ký thành công");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
            @Valid @RequestBody LoginRequest req,
            @RequestHeader(value = CLIENT_ID_HEADER, required = false) String clientId,
            HttpServletResponse response) {
        AuthResponse auth = authService.login(req, clientId);
        setRefreshCookie(response, auth.refreshToken());
        return ApiResponse.ok(auth.withoutRefreshToken(), "Đăng nhập thành công");
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(
            HttpServletRequest request,
            @RequestHeader(value = CLIENT_ID_HEADER, required = false) String clientId,
            HttpServletResponse response) {
        String raw = extractRefreshCookie(request);
        if (raw == null) throw new BusinessException(ErrorCode.INVALID_TOKEN);
        AuthResponse auth = authService.refresh(raw, clientId);
        setRefreshCookie(response, auth.refreshToken());
        return ApiResponse.ok(auth.withoutRefreshToken());
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String raw = extractRefreshCookie(request);
        if (raw != null) authService.logout(raw);
        clearRefreshCookie(response);
        return ApiResponse.ok(null, "Đăng xuất thành công");
    }

    @DeleteMapping("/sessions")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> logoutAll(HttpServletResponse response) {
        authService.logoutAll(SecurityUtils.getCurrentUser().getId());
        clearRefreshCookie(response);
        return ApiResponse.ok(null, "Đã thu hồi tất cả phiên đăng nhập");
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<AuthResponse.UserInfo> me() {
        var user = SecurityUtils.getCurrentUser();
        return ApiResponse.ok(new AuthResponse.UserInfo(
                user.getId(), user.getEmail(),
                user.getDisplayName(), user.getAvatarUrl(), user.getUserType(),
                user.getStudentCode()));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<AuthResponse.UserInfo> updateProfile(@Valid @RequestBody UpdateProfileRequest req) {
        return ApiResponse.ok(authService.updateProfile(SecurityUtils.getCurrentUser().getId(), req));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req);
        return ApiResponse.ok(null, "Nếu email tồn tại, mã OTP đã được gửi");
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ApiResponse.ok(null, "Đặt lại mật khẩu thành công");
    }

    // ─── Cookie helpers ───────────────────────────────────────────────────────────

    private void setRefreshCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(Duration.ofMillis(refreshTokenExpiryMs))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> REFRESH_COOKIE.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
