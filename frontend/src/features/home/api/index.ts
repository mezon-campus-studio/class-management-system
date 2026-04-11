import type { ClassItems } from "@features/home/types";

export const homeAPI = {
    getClasses : async (): Promise<ClassItems[]> => {
        const response = await fetch('url');
        if(!response.ok) throw new Error('Lỗi kết nối');
        return response.json();
    }
}