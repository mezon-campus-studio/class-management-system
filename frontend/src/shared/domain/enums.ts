// ============================================================
// enums.ts — tất cả enum dùng chung toàn app
// Rule: feature chỉ import enum từ đây, không tự định nghĩa lại
// ============================================================

import type { ValueOf } from "@shared/utils";

// --- Auth ---
export const UserType = {   // đây chỉ là obj js tĩnh mô phỏng emun, chưa có thể dùng làm type bởi ts
    INTERNAL: "INTERNAL",
    GOOGLE: "GOOGLE",
    MEZON: "MEZON",
} as const
//  định nghĩa 1 type trùng tên với obj tĩnh kia hỗ trợ cho việc định nghĩa các interface khác
export type UserType = (typeof  UserType)[keyof typeof UserType]

// --- Class ---
export const ClassPrivacy = {
    PUBLIC: "PUBLIC",
    PRIVATE: "PRIVATE",
} as const;
export type ClassPrivacy = ValueOf<typeof ClassPrivacy>;


export const ClassRole = {
    CLASS_ADMIN: "CLASS_ADMIN",
    CLASS_MEMBER: "CLASS_MEMBER",
} as const;
export type ClassRole = ValueOf<typeof ClassRole>;


// --- Group ---
export const GroupRole = {
    GROUP_LEADER: "GROUP_LEADER",
    GROUP_MEMBER: "GROUP_MEMBER",
} as const;
export type GroupRole = ValueOf<typeof GroupRole>;

// --- Activity ---
export const ActivityRegistrationStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
} as const;
export type ActivityRegistrationStatus = ValueOf<typeof ActivityRegistrationStatus>;

// --- Permission ---
// Đây là enum quan trọng nhất — permission_codes trong DB là JSON,
// nếu không chuẩn hóa ở đây thì mỗi feature sẽ tự xử lý string khác nhau.
// Khi BE thêm/đổi permission → chỉ sửa ở đây.
export const PermissionCode = {
    MANAGE_MEMBER: "MANAGE_MEMBER",
    MANAGE_ACTIVITY: "MANAGE_ACTIVITY",
    APPROVE_ACTIVITY: "APPROVE_ACTIVITY",
    MANAGE_ATTENDANCE: "MANAGE_ATTENDANCE",
    MANAGE_FUND: "MANAGE_FUND",
    MANAGE_GROUP: "MANAGE_GROUP",
    APPROVE_LEAVE: "APPROVE_LEAVE",
} as const;
export type PermissionCode = ValueOf<typeof PermissionCode>;