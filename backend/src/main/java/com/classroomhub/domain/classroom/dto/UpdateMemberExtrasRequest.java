package com.classroomhub.domain.classroom.dto;

import com.classroomhub.domain.classroom.entity.ClassroomMember;

import java.util.Set;

/**
 * Patch payload for a teacher to set the secondary roles and explicitly
 * delegated permissions of a classroom member. Either field may be null
 * to leave that aspect unchanged.
 */
public record UpdateMemberExtrasRequest(
        Set<ClassroomMember.Role> extraRoles,
        Set<ClassroomMember.DelegatedPermission> delegatedPermissions
) {}
