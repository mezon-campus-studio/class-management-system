package com.classroomhub.domain.group.dto;

import com.classroomhub.domain.group.entity.Group;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record GroupResponse(
        UUID id,
        UUID classroomId,
        String name,
        String description,
        int memberCount,
        List<GroupMemberResponse> members,
        Instant createdAt
) {
    public static GroupResponse from(Group g, List<GroupMemberResponse> members) {
        return new GroupResponse(
                g.getId(), g.getClassroomId(), g.getName(), g.getDescription(),
                members.size(), members, g.getCreatedAt()
        );
    }
}
