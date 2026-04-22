export interface LoginRequest {
    username: string;
    password?: string;
}

export interface RegisterRequest {
    username: string;
    display_name: string;
    password?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
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
