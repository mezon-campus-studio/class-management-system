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
