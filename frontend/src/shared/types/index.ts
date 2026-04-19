export interface ResponseDTO<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
    time: string;
}