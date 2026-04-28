package com.classroomhub.domain.fund.dto;

import java.math.BigDecimal;
import java.util.List;

public record FundSummary(
        FundResponse fund,
        BigDecimal totalCollected,
        BigDecimal totalExpenses,
        List<CollectionResponse> collections
) {}
