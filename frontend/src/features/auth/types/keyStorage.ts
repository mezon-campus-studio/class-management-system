// dùng cho việc lưu trữ token và refresh token trong localStorage, giúp tách biệt rõ ràng với các dữ liệu khác trong auth-store
export const AUTH_STORAGE_KEY = {
    TOKEN: "auth.token",
    REFRESH: "auth.refreshToken",
} as const;