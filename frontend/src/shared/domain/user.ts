// ============================================================
// user.ts — domain entity cho User
// ============================================================
import type { UserType } from "@shared/domain/enums";
import type { ID, Timestamp } from "@shared/utils/common";

export interface User {
    id?: ID;
    type?: UserType;
    username?: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    joinedAt?: Timestamp;
    token?: string;
}

// Dùng cho profile của chính người dùng đang đăng nhập
// Tách riêng để tránh leak thông tin nhạy cảm khi hiển thị user khác
export interface CurrentUser extends User {
    // Các field bổ sung nếu BE trả về sau khi auth
    // (ví dụ: token claims, session info)
}