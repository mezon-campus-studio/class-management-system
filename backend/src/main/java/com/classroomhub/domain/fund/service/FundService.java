package com.classroomhub.domain.fund.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.repository.ClassroomMemberRepository;
import com.classroomhub.domain.classroom.service.ClassroomService;
import com.classroomhub.domain.fund.dto.*;
import com.classroomhub.domain.fund.entity.*;
import com.classroomhub.domain.auth.service.MailService;
import com.classroomhub.domain.fund.payment.PaymentGateways;
import com.classroomhub.domain.fund.repository.*;
import com.classroomhub.domain.notification.entity.Notification;
import com.classroomhub.domain.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FundService {

    @Value("${classroomhub.app.base-url:http://localhost:5173}")
    private String appBaseUrl;

    private final FundRepository fundRepository;
    private final FundCollectionRepository collectionRepository;
    private final FundPaymentRepository paymentRepository;
    private final FundExpenseRepository expenseRepository;
    private final ClassroomMemberRepository classroomMemberRepository;
    private final UserRepository userRepository;
    private final ClassroomService classroomService;
    private final PaymentGateways paymentGateways;
    private final NotificationService notificationService;
    private final MailService mailService;

    @Transactional
    public FundResponse createFund(UUID classroomId, CreateFundRequest req, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_FUND);
        Fund fund = Fund.builder()
                .classroomId(classroomId)
                .name(req.name())
                .description(req.description())
                .build();
        fundRepository.save(fund);
        return FundResponse.from(fund);
    }

    @Transactional
    public FundResponse updateBankInfo(UUID classroomId, UpdateBankInfoRequest req, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_FUND);
        Fund fund = fundRepository.findByClassroomId(classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FUND_NOT_FOUND));
        fund.setBankAccountName(emptyToNull(req.bankAccountName()));
        fund.setBankAccountNumber(emptyToNull(req.bankAccountNumber()));
        fund.setBankBin(emptyToNull(req.bankBin()));
        fund.setBankShortName(emptyToNull(req.bankShortName()));
        fundRepository.save(fund);
        return FundResponse.from(fund);
    }

    @Transactional(readOnly = true)
    public FundResponse getFund(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Fund fund = fundRepository.findByClassroomId(classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FUND_NOT_FOUND));
        return FundResponse.from(fund);
    }

    @Transactional(readOnly = true)
    public FundSummary getFundSummary(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Fund fund = fundRepository.findByClassroomId(classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FUND_NOT_FOUND));

        List<CollectionResponse> collections = collectionRepository.findByClassroomId(classroomId)
                .stream().map(CollectionResponse::from).toList();

        BigDecimal totalCollected = collections.stream()
                .flatMap(c -> paymentRepository.findByCollectionId(c.id()).stream())
                .filter(p -> p.getStatus() == FundPayment.Status.CONFIRMED)
                .map(FundPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenseRepository.findByClassroomId(classroomId).stream()
                .map(FundExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new FundSummary(FundResponse.from(fund), totalCollected, totalExpenses, collections);
    }

    @Transactional
    public CollectionResponse createCollection(UUID classroomId, CreateCollectionRequest req, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_FUND);
        Fund fund = fundRepository.findByClassroomId(classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FUND_NOT_FOUND));
        FundCollection collection = FundCollection.builder()
                .fundId(fund.getId())
                .classroomId(classroomId)
                .title(req.title())
                .amount(req.amount())
                .description(req.description())
                .dueDate(req.dueDate())
                .build();
        collectionRepository.save(collection);
        return CollectionResponse.from(collection);
    }

    /**
     * Per-collection roll-call. Lists every classroom student (excluding
     * teachers/owner) with their current payment status so the UI can show
     * "ai đã đóng — ai chưa đóng". Aggregates one row per member; if a
     * member has multiple payment records (e.g. previously rejected),
     * the most recent one wins.
     */
    @Transactional(readOnly = true)
    public CollectionStatusResponse getCollectionStatus(UUID classroomId, UUID collectionId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        FundCollection collection = collectionRepository.findById(collectionId)
                .filter(c -> c.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.FUND_NOT_FOUND));

        List<ClassroomMember> members = classroomMemberRepository.findAllByClassroomId(classroomId).stream()
                .filter(m -> m.getRole() != ClassroomMember.Role.OWNER
                        && m.getRole() != ClassroomMember.Role.TEACHER)
                .toList();

        Map<UUID, User> users = userRepository.findAllById(
                        members.stream().map(ClassroomMember::getUserId).toList()).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        // Latest payment per user for this collection.
        Map<UUID, FundPayment> latestByUser = paymentRepository.findByCollectionId(collectionId).stream()
                .collect(Collectors.toMap(
                        FundPayment::getMemberId,
                        Function.identity(),
                        (a, b) -> a.getCreatedAt().isAfter(b.getCreatedAt()) ? a : b));

        int paid = 0, pending = 0, unpaid = 0;
        BigDecimal totalCollected = BigDecimal.ZERO;
        List<CollectionStatusResponse.MemberRow> rows = new ArrayList<>();
        for (ClassroomMember m : members) {
            User u = users.get(m.getUserId());
            FundPayment p = latestByUser.get(m.getUserId());
            CollectionStatusResponse.Status st;
            if (p == null || p.getStatus() == FundPayment.Status.REJECTED) {
                st = CollectionStatusResponse.Status.NONE;
                unpaid++;
            } else if (p.getStatus() == FundPayment.Status.CONFIRMED) {
                st = CollectionStatusResponse.Status.CONFIRMED;
                paid++;
                totalCollected = totalCollected.add(p.getAmount());
            } else {
                st = CollectionStatusResponse.Status.PENDING;
                pending++;
            }
            rows.add(new CollectionStatusResponse.MemberRow(
                    m.getUserId(),
                    m.getId(),
                    m.getDisplayName() != null ? m.getDisplayName() : (u != null ? u.getDisplayName() : ""),
                    u != null ? u.getAvatarUrl() : null,
                    st,
                    p != null ? p.getId() : null,
                    p != null ? p.getAmount() : null,
                    p != null && p.getPaymentMethod() != null ? p.getPaymentMethod().name() : null,
                    p != null ? p.getTransactionRef() : null
            ));
        }
        rows.sort((a, b) -> {
            int rank = statusRank(a.status()) - statusRank(b.status());
            if (rank != 0) return rank;
            return a.displayName().compareToIgnoreCase(b.displayName());
        });

        return new CollectionStatusResponse(
                collectionId,
                collection.getAmount(),
                members.size(),
                paid,
                pending,
                unpaid,
                totalCollected,
                rows
        );
    }

    private static int statusRank(CollectionStatusResponse.Status s) {
        return switch (s) {
            case NONE -> 0;
            case PENDING -> 1;
            case CONFIRMED -> 2;
        };
    }

    /**
     * Treasurer or admin records a payment on behalf of a student
     * (typically a cash payment).
     */
    @Transactional
    public PaymentResponse recordPayment(UUID classroomId, RecordPaymentRequest req, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        boolean canManage = canManageFund(classroomId, userId);
        if (!canManage && !req.memberId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        FundPayment payment = FundPayment.builder()
                .collectionId(req.collectionId())
                .classroomId(classroomId)
                .memberId(req.memberId())
                .amount(req.amount())
                .paymentMethod(FundPayment.Method.CASH)
                .note(req.note())
                .build();
        paymentRepository.save(payment);
        return PaymentResponse.from(payment);
    }

    /**
     * Student-initiated payment. Creates a PENDING payment record and
     * returns the data the client needs to finish paying — VietQR image URL
     * for bank transfer, redirect URL for VNPay/MoMo, or just an ack for cash.
     */
    @Transactional
    public InitiatePaymentResponse initiatePayment(UUID classroomId, InitiatePaymentRequest req, UUID userId, String clientIp) {
        classroomService.requireMember(classroomId, userId);
        FundCollection collection = collectionRepository.findById(req.collectionId())
                .filter(c -> c.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.FUND_NOT_FOUND));
        if (!collection.isActive()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        Fund fund = fundRepository.findByClassroomId(classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FUND_NOT_FOUND));

        BigDecimal amount = req.amount() != null ? req.amount() : collection.getAmount();
        if (amount.signum() <= 0) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        FundPayment payment = FundPayment.builder()
                .collectionId(collection.getId())
                .classroomId(classroomId)
                .memberId(userId)
                .amount(amount)
                .paymentMethod(req.method())
                .note(req.note())
                .build();
        paymentRepository.save(payment);

        // Short, bank-app-friendly description: e.g. "QL ABC123 NguyenVanA"
        String txnRef = "QL" + payment.getId().toString().replace("-", "").substring(0, 10).toUpperCase();
        payment.setTransactionRef(txnRef);
        String transferContent = txnRef;

        String qrUrl = null;
        String redirectUrl = null;
        switch (req.method()) {
            case BANK_TRANSFER -> {
                if (fund.getBankBin() == null || fund.getBankAccountNumber() == null) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR);
                }
                qrUrl = paymentGateways.vietQrImageUrl(
                        fund.getBankBin(),
                        fund.getBankAccountNumber(),
                        fund.getBankAccountName(),
                        amount,
                        transferContent
                );
                notifyTreasurers(classroomId, userId, collection, amount, transferContent, payment.getId());
            }
            case VNPAY -> {
                if (!paymentGateways.isVnpayConfigured()) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR);
                }
                redirectUrl = paymentGateways.buildVnpayUrl(
                        txnRef,
                        amount.longValueExact(),
                        "Thanh toan " + collection.getTitle(),
                        clientIp,
                        "/fund/payments/return"
                );
            }
            case MOMO -> {
                // MoMo requires a server-to-server call to obtain the payUrl;
                // wiring the outbound HTTP call is out of scope of this initial
                // integration. We still create the payment record and return
                // a 501-style hint by leaving redirectUrl null — the client
                // will surface "MoMo chưa được cấu hình".
                if (!paymentGateways.isMomoConfigured()) {
                    throw new BusinessException(ErrorCode.VALIDATION_ERROR);
                }
            }
            case CASH -> {
                // Nothing to do — payment stays PENDING for treasurer to confirm.
            }
        }
        paymentRepository.save(payment);

        return new InitiatePaymentResponse(
                payment.getId(),
                payment.getPaymentMethod(),
                payment.getStatus(),
                payment.getAmount(),
                transferContent,
                qrUrl,
                redirectUrl,
                fund.getBankAccountName(),
                fund.getBankAccountNumber(),
                fund.getBankShortName()
        );
    }

    @Transactional
    public PaymentResponse confirmPayment(UUID classroomId, UUID paymentId, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_FUND);
        FundPayment payment = paymentRepository.findByIdAndClassroomId(paymentId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));
        if (payment.getStatus() == FundPayment.Status.CONFIRMED) {
            throw new BusinessException(ErrorCode.PAYMENT_ALREADY_CONFIRMED);
        }
        payment.setStatus(FundPayment.Status.CONFIRMED);
        payment.setConfirmedById(userId);
        payment.setConfirmedAt(Instant.now());
        paymentRepository.save(payment);

        Fund fund = fundRepository.findByClassroomId(classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FUND_NOT_FOUND));
        fund.setBalance(fund.getBalance().add(payment.getAmount()));
        fundRepository.save(fund);

        return PaymentResponse.from(payment);
    }

    /**
     * Reverse an accidental confirmation — undo the balance adjustment and
     * flip the payment back to PENDING. Used when the treasurer realises
     * the payment didn't actually arrive.
     */
    @Transactional
    public PaymentResponse revertPayment(UUID classroomId, UUID paymentId, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_FUND);
        FundPayment payment = paymentRepository.findByIdAndClassroomId(paymentId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));
        if (payment.getStatus() != FundPayment.Status.CONFIRMED) return PaymentResponse.from(payment);

        payment.setStatus(FundPayment.Status.PENDING);
        payment.setConfirmedById(null);
        payment.setConfirmedAt(null);
        paymentRepository.save(payment);

        Fund fund = fundRepository.findByClassroomId(classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FUND_NOT_FOUND));
        fund.setBalance(fund.getBalance().subtract(payment.getAmount()));
        fundRepository.save(fund);

        return PaymentResponse.from(payment);
    }

    /** Từ chối thanh toán — trạng thái về REJECTED, học sinh cần nộp lại. */
    @Transactional
    public PaymentResponse rejectPayment(UUID classroomId, UUID paymentId, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_FUND);
        FundPayment payment = paymentRepository.findByIdAndClassroomId(paymentId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));
        if (payment.getStatus() != FundPayment.Status.PENDING) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        payment.setStatus(FundPayment.Status.REJECTED);
        paymentRepository.save(payment);

        FundCollection collection = collectionRepository.findById(payment.getCollectionId()).orElse(null);
        String collectionTitle = collection != null ? collection.getTitle() : "đợt thu";
        notificationService.send(
                payment.getMemberId(), classroomId,
                Notification.Type.FUND_PAYMENT_REJECTED,
                "Giao dịch bị từ chối",
                "Thanh toán của bạn cho đợt thu \"" + collectionTitle + "\" đã bị từ chối. Vui lòng liên hệ thủ quỹ hoặc nộp lại.",
                payment.getId());

        return PaymentResponse.from(payment);
    }

    @Transactional
    public ExpenseResponse addExpense(UUID classroomId, CreateExpenseRequest req, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_FUND);
        Fund fund = fundRepository.findByClassroomId(classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FUND_NOT_FOUND));
        fund.setBalance(fund.getBalance().subtract(req.amount()));
        fundRepository.save(fund);

        FundExpense expense = FundExpense.builder()
                .fundId(fund.getId())
                .classroomId(classroomId)
                .title(req.title())
                .amount(req.amount())
                .description(req.description())
                .recordedById(userId)
                .expenseDate(req.expenseDate() != null ? req.expenseDate() : Instant.now())
                .build();
        expenseRepository.save(expense);
        return ExpenseResponse.from(expense);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listPayments(UUID classroomId, UUID collectionId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return paymentRepository.findByCollectionId(collectionId).stream()
                .map(PaymentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listMyPayments(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return paymentRepository.findByClassroomIdAndMemberId(classroomId, userId).stream()
                .map(PaymentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> listExpenses(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return expenseRepository.findByClassroomId(classroomId).stream()
                .map(ExpenseResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<CollectionResponse> listCollections(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return collectionRepository.findByClassroomId(classroomId).stream()
                .map(CollectionResponse::from).toList();
    }

    /** Public so the controller can advertise capabilities to the client. */
    @Transactional(readOnly = true)
    public boolean canManageFund(UUID classroomId, UUID userId) {
        try {
            classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_FUND);
            return true;
        } catch (BusinessException e) {
            return false;
        }
    }

    public boolean isVnpayEnabled() { return paymentGateways.isVnpayConfigured(); }
    public boolean isMomoEnabled()  { return paymentGateways.isMomoConfigured(); }

    /** Returns a single payment; only the payment owner or a fund manager may read it. */
    @Transactional(readOnly = true)
    public PaymentResponse getPayment(UUID classroomId, UUID paymentId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        FundPayment payment = paymentRepository.findByIdAndClassroomId(paymentId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));
        if (!payment.getMemberId().equals(userId) && !canManageFund(classroomId, userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return PaymentResponse.from(payment);
    }

    /**
     * Finds all fund managers of a classroom and sends each of them an in-app
     * notification + email so they can quickly confirm the incoming transfer.
     * Runs inside the same transaction as initiatePayment but notification
     * delivery is @Async so it won't block the response.
     */
    private void notifyTreasurers(UUID classroomId, UUID studentId,
                                   FundCollection collection, BigDecimal amount,
                                   String txnRef, UUID paymentId) {
        User student = userRepository.findById(studentId).orElse(null);
        String studentName = student != null ? student.getDisplayName() : "Học sinh";

        String notifTitle = "Thanh toán mới đang chờ xác nhận";
        String notifBody  = "%s vừa chuyển khoản %s ₫ cho đợt thu \"%s\" — nội dung: %s"
                .formatted(studentName, String.format("%,d", amount.longValue()),
                        collection.getTitle(), txnRef);
        String fundUrl = appBaseUrl + "/classrooms/" + classroomId + "/fund";

        classroomMemberRepository.findAllByClassroomId(classroomId).stream()
                .filter(m -> m.getRole() == ClassroomMember.Role.OWNER
                          || m.getRole() == ClassroomMember.Role.TEACHER
                          || m.getDelegatedPermissions()
                               .contains(ClassroomMember.DelegatedPermission.MANAGE_FUND))
                .filter(m -> !m.getUserId().equals(studentId))
                .forEach(manager -> {
                    notificationService.send(
                            manager.getUserId(), classroomId,
                            Notification.Type.FUND_PAYMENT_INITIATED,
                            notifTitle, notifBody, paymentId);

                    userRepository.findById(manager.getUserId()).ifPresent(u ->
                            mailService.sendFundPaymentInitiated(
                                    u.getEmail(),
                                    u.getDisplayName(),
                                    studentName,
                                    collection.getTitle(),
                                    amount.longValue(),
                                    txnRef,
                                    fundUrl));
                });
    }

    private static String emptyToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
