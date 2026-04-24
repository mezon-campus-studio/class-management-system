export interface AccessTokenPayload {
    sub: string;        // username
    iss: string;
    iat: number;
    exp: number;
    jti: string;

    type: 'access';
    user_id: number;
}

export interface RefreshTokenPayload {
    sub: string;
    iss: string;
    iat: number;
    exp: number;
    jti: string;

    type: 'refresh';
}

export type JwtPayload = AccessTokenPayload | RefreshTokenPayload;