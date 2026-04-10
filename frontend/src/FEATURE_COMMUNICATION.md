# Feature Communication Guidelines

## 1. Nguyên tắc cốt lõi

> **Feature không được truy cập trực tiếp implementation của feature khác**

* Không import file nội bộ
* Không dùng logic private
* Chỉ dùng **public API**

---

## 2. Public API của Feature

Mỗi feature phải expose một **entry point duy nhất**:

```ts
// src/features/auth/index.ts
export { useAuth } from './hooks/useAuth';
```

### Cách sử dụng:

```ts
import { useAuth } from '@features/auth';
```

---

### Không được phép:

```ts
// Sai
import { useAuthInternal } from '@features/auth/hooks/internal/useAuthInternal';
import { loginApi } from '@features/auth/api/login';
```

---

## 3. Hook là Interface chính của Feature

### Quy ước:

* Mỗi feature expose **1–2 hook public**
* Hook đóng vai trò **facade (interface layer)**

```ts
// src/features/auth/hooks/useAuth.ts
export const useAuth = () => {
  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
};
```

---

## 4. Phân loại Hook

### 4.1 Public Hook

* Được phép dùng ngoài feature
* Đại diện cho business logic

```ts
useAuth
useCart
useChat
```

---

### 4.2 Internal Hook

* Chỉ dùng nội bộ
* Không export ra ngoài

```ts
useAuthInternal
useAuthStorage
useAuthApi
```

### Cấu trúc:

```ts
hooks/
  useAuth.ts
  internal/
    useAuthStorage.ts
    useAuthApi.ts
```

---

## 5. Dependency Flow (bắt buộc)

```txt
app → features → entities → shared
```

---

### Không hợp lệ:

```txt
features → app
features → features (deep import)
```

---

## 6. Cách chia sẻ dữ liệu giữa các Feature

### 6.1 Qua Public Hook (recommended)

hook cần public thì bỏ vào trong `@features/<feat_name>/hook/index.ts` và export theo tên `use<Feat_name>`

```ts
// @features/auth/hook
import { useAuth } from '@features/auth/hook'
const { user } = useAuth();
```

---

### 6.2 Qua Global State (`app/providers` hoặc `store`)

Áp dụng khi:

* nhiều feature cần
* state mang tính toàn cục

---

### 6.3 Qua Domain Layer (`entities`)

```ts
src/entities/user.ts
```

---

### Quy tắc:

* Không đặt domain model trong feature nếu dùng nhiều nơi
* `User`, `Role`, `Permission` -> phải nằm ở layer chung

---

## 7. Naming Convention

| Thành phần     | Quy ước                                     |
| -------------- | ------------------------------------------- |
| Public Hook    | `use<Auth>`                                 |
| Internal Hook  | `use<Auth>Internal` hoặc `use<Auth><Logic>` |
| Context        | `AuthContext`                               |
| Type           | `AuthContextType`, `User`                   |
| Feature Folder | lowercase (`auth`, `chat`)                  |

---

## 8. Enforcement (đang cân nhắc)

### ESLint Rule

```js
"no-restricted-imports": [
  "error",
  {
    "patterns": [
      "@features/*/hooks/internal/*",
      "@features/*/api/*"
    ]
  }
]
```

---

## 9. Trường hợp Feature được dùng Feature khác

Chỉ hợp lệ trong các trường hợp:

### ✔ Thông qua public hook

```ts
useAuth()
```

---

### Thông qua shared domain

```ts
User
```

---

### Thông qua app layer (composition)

```ts
const auth = useAuth();
const chat = useChat();
```

---

## 10. Anti-pattern (cấm)

### 10.1 Import sâu vào internal

```ts
@features/auth/hooks/internal/*
```

---

### 10.2 Reuse logic business sai layer

```ts
// Sai
import { validatePassword } from '@features/auth/utils';
```

→ phải chuyển sang:

```ts
@shared/utils
```

---

## 11. Nguyên tắc thiết kế

* Feature = module độc lập
* Hook public = API của module
* Internal = implementation chi tiết
* Không expose internals

---

## 12. Ví dụ đúng

```ts
// feature chat
import { useAuth } from '@features/auth';

export const useChat = () => {
  const { user } = useAuth();

  return {
    currentUserId: user?.id,
  };
};
```

---

## 13. Kết luận

* Feature chỉ giao tiếp qua **public API**
* Hook public là **entry point duy nhất**
* Không import sâu
* Tách rõ interface và implementation

---

## 14. Nguyên tắc bắt buộc (TL;DR)

* Không import từ `features/*/*/*`
* Chỉ import từ `features/<feature>`
* Mỗi feature expose tối đa 1–2 hook
* Internal phải nằm trong `internal/`
* Domain dùng chung → đưa ra `entities/`

---