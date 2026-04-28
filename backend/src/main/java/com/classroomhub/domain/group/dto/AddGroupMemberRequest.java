package com.classroomhub.domain.group.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddGroupMemberRequest(
        @NotNull(message = "classroomMemberId không được để trống")
        UUID classroomMemberId
) {}
