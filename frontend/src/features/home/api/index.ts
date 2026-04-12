import type { ClassItems } from "@features/home/types";

const mockData: ClassItems[] = [
  {
    id: "1",
    className: "Lập trình .NET nâng cao",
    owner: "Nguyễn Văn A",
    status: "public",
    classCode: "DOTNET123",
    userJoinStatus: "joined"
  },
  {
    id: "2",
    className: "Phát triển Web với React",
    owner: "Trần Thị B",
    status: "private",
    classCode: "REACT456",
    userJoinStatus: "pending"
  },
];

export const homeAPI = {
  getClasses: async (): Promise<ClassItems[]> => {
    // KHI MUỐN DÙNG MOCK:
    return new Promise((resolve) => setTimeout(() => resolve(mockData), 500));

    // KHI MUỐN DÙNG THẬT (Bỏ cmt phía dưới):
    /*
    const response = await fetch('url');
    if(!response.ok) throw new Error('Lỗi kết nối');
    return response.json();
    */
  }
}