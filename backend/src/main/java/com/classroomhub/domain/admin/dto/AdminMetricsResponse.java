package com.classroomhub.domain.admin.dto;

public record AdminMetricsResponse(
        long totalUsers,
        long totalStudents,
        long totalTeachers,
        long totalParents,
        long totalAdmins,
        long totalClassrooms,
        long activeClassrooms,
        long totalParentLinks
) {}
