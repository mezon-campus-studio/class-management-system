# Feature Communication Guidelines

## 1. Nguyên tắc cốt lõi

> **Feature không được truy cập trực tiếp implementation nội bộ của feature khác.**

*   Không import từ các folder con (`api/`, `hooks/`, `components/`, `types/`).
*   Chỉ được phép import từ **Entry Point duy nhất** của feature: `@features/<feature-name>`.

---

## 2. Cấu trúc chuẩn của một Feature

Mỗi feature phải tuân thủ cấu trúc thư mục tinh gọn sau:

```txt
src/features/<feature-name>/
├── index.ts              # Entry Point: Export Public API (Hook, Types)
├── api/                  # Logic gọi API
├── types/                # Type & Interface
├── hooks/                # Các hooks của feature (bao gồm cả logic internal)
├── components/           # UI Components dành riêng cho feature
└── pages/                # Các trang (Route components)
```

---

## 3. Entry Point (`index.ts`)

`index.ts` là bộ mặt của feature. Chỉ những gì được export ở đây mới được coi là **Public API**.

### 3.1 Quy tắc export Hook

*   **Public Facade Hook**: Được định nghĩa tại `index.ts`. Nó gọi các hook logic trong folder `hooks/` nhưng chỉ trả ra những thông tin/hành động mà "người ngoài" cần.
*   **Internal Logic Hook**: Nằm trong folder `hooks/`. Chứa logic phức tạp, state loading/error... dùng cho các Page nội bộ của feature. **Không export** tại `index.ts`.

**Ví dụ chuẩn (`src/features/auth/index.ts`):**

```ts
import { useAuthStore } from './hooks/useAuthStore';
import { useAuthInternal } from './hooks/useAuthInternal';

// Public Facade Hook: Feature khác chỉ thấy thông tin cần thiết
export const useAuth = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuthInternal(); 

  return {
    user,
    isAuthenticated,
    logout,
  };
};

export * from './types';
```

---

## 4. Cách sử dụng (Import)

### ✅ Đúng:

```ts
import { useAuth } from '@features/auth';
```

### ❌ Sai (Vi phạm đóng gói):

```ts
import { useAuthInternal } from '@features/auth/hooks/useAuthInternal';
import { authApi } from '@features/auth/api';
```

---

## 5. Dependency Flow (Bắt buộc)

Dòng phụ thuộc chỉ được phép đi theo một chiều:
`app → features → shared`

---

## 6. TL;DR - Quy tắc vàng

1.  Mọi thứ bên ngoài cần phải lấy từ `@features/<feature>`.
2.  Hook ở `index.ts` là một **Facade** (giao diện sạch sẽ).
3.  Không tạo thêm folder `internal/` bên trong `hooks/` để giữ cấu trúc phẳng, nhưng vẫn quản lý export nghiêm ngặt tại `index.ts`.

---
