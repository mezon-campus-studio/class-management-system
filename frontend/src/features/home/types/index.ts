export interface ClassItems {
  id: string;
  className: string;
  owner: string;
  status: "public" | "private";
  classCode: string;
  password?: string; // Mật khẩu (Chỉ nhóm kín cần)
}
