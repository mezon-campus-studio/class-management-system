// ============================================================
// class.ts — domain entity cho Class, ClassMember, ClassGroup
// ============================================================
import type { ID, Timestamp } from "@shared/utils/common";
import { ClassRole, type ClassPrivacy, type PermissionCode } from "./enums";
import type { User } from "./user";

export interface Class {
    id: ID;
    name: string | null;
    description: string | null;
    code: string;
    avatarUrl: string | null;
    privacy: ClassPrivacy;
    createdAt: Timestamp;
    ownerUserId: ID;
}

// ClassMember là domain model đúng — không phải ClassUser như trong DB
// Lý do: feature không cần biết đến class_id hay user_id raw,
// chỉ cần biết user là ai và quyền của họ là gì
export interface ClassMember {
    id: ID;
    user: User;
    role: ClassRole;
    permissions: PermissionCode[];
    joinedAt: Timestamp;
}

// Helper: kiểm tra permission — dùng trong hook/UI logic
export function hasPermission(
    member: ClassMember,
    code: PermissionCode
): boolean {
    return (
        member.role === ClassRole.CLASS_ADMIN ||
        member.permissions.includes(code)
    );
}