package com.classroomhub.domain.fund.dto;

/**
 * Treasurer (or whoever holds MANAGE_FUND) configures the bank info that
 * VietQR codes and bank-transfer instructions are generated from. Any
 * field may be null to clear it.
 */
public record UpdateBankInfoRequest(
        String bankAccountName,
        String bankAccountNumber,
        String bankBin,
        String bankShortName
) {}
