package com.classroomhub.domain.emulation.dto;

import java.util.UUID;

public record MemberScoreSummary(
        UUID memberId,
        long totalScore
) {}
