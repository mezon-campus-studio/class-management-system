package com.classroomhub.domain.fund.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import java.util.TreeMap;

/**
 * Vietnamese payment-gateway helpers.
 *
 * <p>VietQR is implemented fully (it is just a URL to vietqr.io's image
 * service — no merchant account required). VNPay and MoMo are wired with
 * proper request signing but require credentials in {@code application.properties};
 * when credentials are absent {@link #isVnpayConfigured()}/{@link #isMomoConfigured()}
 * return {@code false} so the UI can disable those options.</p>
 */
@Component
public class PaymentGateways {

    @Value("${classroomhub.app.base-url:http://localhost:5173}")
    private String appBaseUrl;

    // ─── VNPay ───────────────────────────────────────────────────────────────
    @Value("${classroomhub.payment.vnpay.tmn-code:}")
    private String vnpayTmnCode;
    @Value("${classroomhub.payment.vnpay.hash-secret:}")
    private String vnpayHashSecret;
    @Value("${classroomhub.payment.vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpayUrl;

    // ─── MoMo ────────────────────────────────────────────────────────────────
    @Value("${classroomhub.payment.momo.partner-code:}")
    private String momoPartnerCode;
    @Value("${classroomhub.payment.momo.access-key:}")
    private String momoAccessKey;
    @Value("${classroomhub.payment.momo.secret-key:}")
    private String momoSecretKey;
    @Value("${classroomhub.payment.momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String momoEndpoint;

    public boolean isVnpayConfigured() {
        return !vnpayTmnCode.isBlank() && !vnpayHashSecret.isBlank();
    }

    public boolean isMomoConfigured() {
        return !momoPartnerCode.isBlank() && !momoAccessKey.isBlank() && !momoSecretKey.isBlank();
    }

    /**
     * Build a VietQR image URL. The format follows vietqr.io's public
     * endpoint, which produces a NAPAS-compliant QR that any Vietnamese
     * banking app can scan.
     *
     * @param bin           SBV BIN of the receiving bank (e.g. {@code 970436} for VCB)
     * @param accountNumber receiving account number
     * @param accountName   account holder display name
     * @param amount        amount in VND (no decimals)
     * @param description   short description shown on the bank app's prefilled note
     */
    public String vietQrImageUrl(String bin, String accountNumber, String accountName,
                                 BigDecimal amount, String description) {
        if (bin == null || bin.isBlank() || accountNumber == null || accountNumber.isBlank()) {
            return null;
        }
        String amt = amount != null ? amount.toBigInteger().toString() : "0";
        StringBuilder sb = new StringBuilder("https://img.vietqr.io/image/");
        sb.append(urlEncode(bin)).append('-')
                .append(urlEncode(accountNumber)).append("-compact2.png");
        sb.append("?amount=").append(amt);
        if (description != null && !description.isBlank()) {
            sb.append("&addInfo=").append(urlEncode(description));
        }
        if (accountName != null && !accountName.isBlank()) {
            sb.append("&accountName=").append(urlEncode(accountName));
        }
        return sb.toString();
    }

    /**
     * Build a VNPay payment URL. Throws if VNPay isn't configured —
     * callers should guard with {@link #isVnpayConfigured()}.
     */
    public String buildVnpayUrl(String txnRef, long amountVnd, String orderInfo, String clientIp, String returnPath) {
        TreeMap<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayTmnCode);
        // VNPay expects amount * 100
        params.put("vnp_Amount", String.valueOf(amountVnd * 100L));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", appBaseUrl + returnPath);
        params.put("vnp_IpAddr", clientIp != null ? clientIp : "127.0.0.1");

        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");
        fmt.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        params.put("vnp_CreateDate", fmt.format(new Date()));

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        boolean first = true;
        for (var entry : params.entrySet()) {
            if (entry.getValue() == null || entry.getValue().isEmpty()) continue;
            if (!first) {
                hashData.append('&');
                query.append('&');
            }
            String key = urlEncode(entry.getKey());
            String value = urlEncode(entry.getValue());
            hashData.append(key).append('=').append(value);
            query.append(key).append('=').append(value);
            first = false;
        }
        String secureHash = hmacSha512(vnpayHashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);
        return vnpayUrl + "?" + query;
    }

    /**
     * Build a MoMo payment URL. Real integration involves a server-to-server
     * call to {@link #momoEndpoint} that returns a {@code payUrl}. We expose
     * the request body builder + signature so the caller can perform the
     * outbound call when ready. Returns {@code null} if MoMo isn't configured.
     */
    public String buildMomoSignedRequestBody(String txnRef, long amountVnd, String orderInfo, String returnPath) {
        if (!isMomoConfigured()) return null;
        String requestId = txnRef + "-" + System.currentTimeMillis();
        String redirectUrl = appBaseUrl + returnPath;
        String ipnUrl = appBaseUrl + "/api/v1/payments/momo/ipn";

        String rawSignature = "accessKey=" + momoAccessKey
                + "&amount=" + amountVnd
                + "&extraData="
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + txnRef
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + momoPartnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=captureWallet";
        String signature = hmacSha256(momoSecretKey, rawSignature);

        // Caller posts this JSON body to momoEndpoint and reads payUrl from the response.
        return "{"
                + "\"partnerCode\":\"" + momoPartnerCode + "\","
                + "\"accessKey\":\"" + momoAccessKey + "\","
                + "\"requestId\":\"" + requestId + "\","
                + "\"amount\":\"" + amountVnd + "\","
                + "\"orderId\":\"" + txnRef + "\","
                + "\"orderInfo\":\"" + orderInfo + "\","
                + "\"redirectUrl\":\"" + redirectUrl + "\","
                + "\"ipnUrl\":\"" + ipnUrl + "\","
                + "\"extraData\":\"\","
                + "\"requestType\":\"captureWallet\","
                + "\"signature\":\"" + signature + "\","
                + "\"lang\":\"vi\""
                + "}";
    }

    private static String urlEncode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private static String hmacSha512(String key, String data) {
        return hmac("HmacSHA512", key, data);
    }

    private static String hmacSha256(String key, String data) {
        return hmac("HmacSHA256", key, data);
    }

    private static String hmac(String algo, String key, String data) {
        try {
            Mac mac = Mac.getInstance(algo);
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), algo));
            byte[] sig = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(sig.length * 2);
            for (byte b : sig) hex.append(String.format(Locale.ROOT, "%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to compute " + algo, e);
        }
    }
}
