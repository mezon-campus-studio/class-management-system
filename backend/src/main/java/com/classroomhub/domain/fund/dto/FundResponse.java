package com.classroomhub.domain.fund.dto;

import com.classroomhub.domain.fund.entity.Fund;

import java.math.BigDecimal;
import java.util.UUID;

public record FundResponse(
        UUID id,
        String name,
        String description,
        BigDecimal balance,
        String bankAccountName,
        String bankAccountNumber,
        String bankBin,
        String bankShortName
) {
    public static FundResponse from(Fund fund) {
        return new FundResponse(
                fund.getId(),
                fund.getName(),
                fund.getDescription(),
                fund.getBalance(),
                fund.getBankAccountName(),
                fund.getBankAccountNumber(),
                fund.getBankBin(),
                fund.getBankShortName()
        );
    }
}
