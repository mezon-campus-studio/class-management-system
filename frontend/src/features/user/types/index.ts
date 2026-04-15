export type SystemUserType = 'GOOGLE' | 'MEZON' | 'INTERNAL';

export interface User {
    id: number;
    type: SystemUserType;
    username: string;
    displayName: string;
    avatarUrl: string;
    email?: string;
    phone?: string;
    joinedAt: string;
}

export type ClassRole = 'ADMIN' | 'MEMBER';

// lớp user cho từng người trong lớp hiện tại
export interface ClassMember {
    id: string;
    classId: string;
    userId: number;
    user?: User;
    role: ClassRole;
    permissions: string[];
    joinedAt: string;
}

