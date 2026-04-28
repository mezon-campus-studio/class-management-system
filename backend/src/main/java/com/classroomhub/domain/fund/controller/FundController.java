package com.classroomhub.domain.fund.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.fund.dto.*;
import com.classroomhub.domain.fund.service.FundService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms/{classroomId}/fund")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class FundController {

    private final FundService fundService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FundResponse> createFund(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreateFundRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.createFund(classroomId, req, userId));
    }

    @GetMapping
    public ApiResponse<FundResponse> getFund(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.getFund(classroomId, userId));
    }

    @PatchMapping("/bank-info")
    public ApiResponse<FundResponse> updateBankInfo(
            @PathVariable UUID classroomId,
            @RequestBody UpdateBankInfoRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.updateBankInfo(classroomId, req, userId));
    }

    @GetMapping("/summary")
    public ApiResponse<FundSummary> getFundSummary(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.getFundSummary(classroomId, userId));
    }

    /** Capability flags so the client knows which payment methods to show. */
    @GetMapping("/capabilities")
    public ApiResponse<Map<String, Boolean>> getCapabilities(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(Map.of(
                "canManage", fundService.canManageFund(classroomId, userId),
                "vnpayEnabled", fundService.isVnpayEnabled(),
                "momoEnabled", fundService.isMomoEnabled()
        ));
    }

    @PostMapping("/collections")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CollectionResponse> createCollection(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreateCollectionRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.createCollection(classroomId, req, userId));
    }

    @GetMapping("/collections")
    public ApiResponse<List<CollectionResponse>> listCollections(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.listCollections(classroomId, userId));
    }

    @GetMapping("/collections/{collectionId}/status")
    public ApiResponse<CollectionStatusResponse> getCollectionStatus(
            @PathVariable UUID classroomId,
            @PathVariable UUID collectionId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.getCollectionStatus(classroomId, collectionId, userId));
    }

    @PostMapping("/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponse> recordPayment(
            @PathVariable UUID classroomId,
            @Valid @RequestBody RecordPaymentRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.recordPayment(classroomId, req, userId));
    }

    @PostMapping("/payments/initiate")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<InitiatePaymentResponse> initiatePayment(
            @PathVariable UUID classroomId,
            @Valid @RequestBody InitiatePaymentRequest req,
            HttpServletRequest http) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        String ip = http.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = http.getRemoteAddr();
        return ApiResponse.ok(fundService.initiatePayment(classroomId, req, userId, ip));
    }

    @PostMapping("/payments/{paymentId}/confirm")
    public ApiResponse<PaymentResponse> confirmPayment(
            @PathVariable UUID classroomId,
            @PathVariable UUID paymentId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.confirmPayment(classroomId, paymentId, userId));
    }

    @PostMapping("/payments/{paymentId}/revert")
    public ApiResponse<PaymentResponse> revertPayment(
            @PathVariable UUID classroomId,
            @PathVariable UUID paymentId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.revertPayment(classroomId, paymentId, userId));
    }

    @GetMapping("/payments")
    public ApiResponse<List<PaymentResponse>> listPayments(
            @PathVariable UUID classroomId,
            @RequestParam UUID collectionId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.listPayments(classroomId, collectionId, userId));
    }

    @GetMapping("/payments/me")
    public ApiResponse<List<PaymentResponse>> listMyPayments(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.listMyPayments(classroomId, userId));
    }

    @PostMapping("/expenses")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ExpenseResponse> addExpense(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreateExpenseRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.addExpense(classroomId, req, userId));
    }

    @GetMapping("/expenses")
    public ApiResponse<List<ExpenseResponse>> listExpenses(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(fundService.listExpenses(classroomId, userId));
    }
}
