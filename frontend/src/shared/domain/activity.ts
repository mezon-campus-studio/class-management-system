// ============================================================
// activity.ts — domain entity cho Activity và ActivityRegistration
// ============================================================
import type { User } from "@features/user";
import { ActivityRegistrationStatus } from "@shared/domain/enums";
import type { ID, Timestamp } from "@shared/utils/common";

export interface Activity {
    id: ID;
    classId: ID;
    name: string;
    description: string | null;
    startAt: Timestamp | null;
    endAt: Timestamp | null;
    location: string | null;
    point: number | null;
    isMandatory: boolean;
    createdAt: Timestamp;
}

export interface ActivityRegistration {
    id: ID;
    activityId: ID;
    registeredUser: User;
    proofImageUrl: string | null;
    status: ActivityRegistrationStatus;
    registeredAt: Timestamp;
}

// State machine helpers — encode transition rule tại đây
// thay vì rải logic kiểm tra status ra khắp các component

export function canApprove(reg: ActivityRegistration): boolean {
    return reg.status === ActivityRegistrationStatus.PENDING;
}

export function canReject(reg: ActivityRegistration): boolean {
    return reg.status === ActivityRegistrationStatus.PENDING;
}

// Derived data — tổng hợp điểm rèn luyện của 1 user trong 1 class
// FE tự tính từ danh sách registrations đã APPROVED
// Khi BE có endpoint riêng thì mapper sẽ map vào đây thay vì tính lại
export interface UserActivitySummary {
    userId: ID;
    approvedCount: number;
    totalPoint: number;
    mandatoryApproved: number;
    mandatoryTotal: number;
}

export function computeActivitySummary(
    userId: ID,
    registrations: ActivityRegistration[],
    activitiesMap: Map<ID, Activity>
): UserActivitySummary {
    const approved = registrations.filter(
        (r) =>
            r.registeredUser.id === userId &&
            r.status === ActivityRegistrationStatus.APPROVED
    );

    let totalPoint = 0;
    let mandatoryApproved = 0;

    for (const reg of approved) {
        const act = activitiesMap.get(reg.activityId);
        if (!act) continue;
        totalPoint += act.point ?? 0;
        if (act.isMandatory) mandatoryApproved++;
    }

    const mandatoryTotal = [...activitiesMap.values()].filter(
        (a) => a.isMandatory
    ).length;

    return {
        userId,
        approvedCount: approved.length,
        totalPoint,
        mandatoryApproved,
        mandatoryTotal,
    };
}