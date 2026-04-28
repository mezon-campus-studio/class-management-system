package com.classroomhub.config;

import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@classroomhub.local}")
    private String adminEmail;

    @Value("${app.admin.password:ChangeMe@123}")
    private String adminPassword;

    @EventListener(ApplicationReadyEvent.class)
    public void seedAdmin() {
        if (userRepository.existsByUserType(User.UserType.SYSTEM_ADMIN)) {
            return;
        }
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.warn("Admin email {} đã tồn tại nhưng không phải SYSTEM_ADMIN — bỏ qua bootstrap", adminEmail);
            return;
        }
        User admin = User.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .displayName("System Administrator")
                .userType(User.UserType.SYSTEM_ADMIN)
                .status(User.Status.ACTIVE)
                .build();
        userRepository.save(admin);
        log.warn("================================================");
        log.warn("  ✅ Đã tạo tài khoản System Admin mặc định");
        log.warn("     Email:    {}", adminEmail);
        log.warn("     Password: {}", adminPassword);
        log.warn("     ⚠️  ĐỔI MẬT KHẨU NGAY sau khi đăng nhập!");
        log.warn("================================================");
    }
}
