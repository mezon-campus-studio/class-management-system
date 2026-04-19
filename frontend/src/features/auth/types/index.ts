export interface LoginRequest {
    username: string;
    password?: string;
}

export interface RegisterRequest {
    username: string;
    displayName: string;
    password?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterResponse {
    username: string;
}

export interface SignOutRequest {
    accessToken: string;
}

export interface SignOutResponse {
    success: boolean;
}
