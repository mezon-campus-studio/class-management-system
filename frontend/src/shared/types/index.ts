export type CommonProps = { className?: string };

export interface ResponseDTO<T> {
  success: boolean;
  message: string;
  data: T;
  time: string;
}