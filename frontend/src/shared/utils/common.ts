// ============================================================
// common.ts — utility types dùng chung, không phụ thuộc business
// ============================================================

// Map đúng với ResponseDTO<Data> của backend:
// { success, message, data, time }
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    time: string; // ISO string (backend format: DateTimeConstant.PATTERN)
}

// Dùng khi endpoint trả về danh sách có phân trang
// (hiện chưa có trong spec nhưng chắc chắn sẽ cần)
export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

// ID chuẩn hóa — backend dùng bigint, TS dùng number
// Nếu sau này BE đổi sang string/UUID → chỉ sửa ở đây
export type ID = number;

// Timestamp chuẩn hóa — luôn là string ISO từ API
export type Timestamp = string;