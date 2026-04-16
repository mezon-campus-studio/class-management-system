// ============================================================
// group.ts — domain entity cho Group và GroupMember
// ============================================================

import type { User } from "@features/user";
import type { GroupRole } from "@shared/domain/enums";
import type { ID, Timestamp } from "@shared/utils/common";

export interface Group {
    id: ID;
    classId: ID;
    name: string | null;
    leader: User;
    createdAt: Timestamp;
}

export interface GroupMember {
    id: ID;
    user: User;
    role: GroupRole;
    joinedAt: Timestamp;
}