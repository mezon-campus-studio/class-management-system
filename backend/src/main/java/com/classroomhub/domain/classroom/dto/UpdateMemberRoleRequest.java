package com.classroomhub.domain.classroom.dto;

import com.classroomhub.domain.classroom.entity.ClassroomMember;
import jakarta.validation.constraints.NotNull;

public record UpdateMemberRoleRequest(
        @NotNull(message = "Role không được để trống")
        ClassroomMember.Role role
) {}
