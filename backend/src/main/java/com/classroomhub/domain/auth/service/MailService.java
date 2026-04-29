package com.classroomhub.domain.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Async
    public void sendFundPaymentInitiated(String to, String treasurerName,
                                         String studentName, String collectionTitle,
                                         long amountVnd, String txnRef, String fundUrl) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromAddress);
            msg.setTo(to);
            msg.setSubject("[ClassroomHub] Thanh toán mới đang chờ xác nhận — " + collectionTitle);
            msg.setText("""
                    Xin chào %s,

                    Học sinh %s vừa khởi tạo thanh toán quỹ lớp và đang chờ bạn xác nhận sau khi tiền về.

                    Thông tin thanh toán:
                      • Đợt thu  : %s
                      • Số tiền  : %s ₫
                      • Phương thức: Chuyển khoản ngân hàng (VietQR)
                      • Nội dung CK: %s

                    Sau khi kiểm tra tiền đã về tài khoản, vui lòng xác nhận tại:
                    %s

                    Nếu chưa nhận được tiền, bạn có thể bỏ qua email này.

                    Trân trọng,
                    Đội ngũ ClassroomHub
                    """.formatted(
                    treasurerName,
                    studentName,
                    collectionTitle,
                    String.format("%,d", amountVnd),
                    txnRef,
                    fundUrl
            ));
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send fund payment email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetOtp(String to, String otp) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromAddress);
            msg.setTo(to);
            msg.setSubject("[ClassroomHub] Mã xác thực đặt lại mật khẩu");
            msg.setText("""
                    Xin chào,

                    Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản ClassroomHub.

                    Mã OTP của bạn là: %s

                    Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.

                    Trân trọng,
                    Đội ngũ ClassroomHub
                    """.formatted(otp));
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }
}
