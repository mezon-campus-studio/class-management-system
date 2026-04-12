export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: number;
  type: UserRole;
  username: string;
  displayName: string;
  avatarUrl: string;
  joinedAt: string;
}

export interface LoginRequest {
  username: string;
  password?: string; // Sẽ dùng cho sau này khi có login thật
}

export interface RegisterRequest {
  username: string;
  displayName: string;
  type: UserRole;
  password?: string; // Sẽ dùng cho sau này khi có signup thật
}
