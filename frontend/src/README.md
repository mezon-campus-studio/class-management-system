# ClassManagement Frontend Architecture

Dự án này sử dụng kiến trúc phân lớp dựa trên feature (Feature-Based Architecture) nhằm tối ưu hóa khả năng mở rộng và bảo trì.

## Cấu trúc thư mục `src/`

### 1. `app/`
Thiết lập cấp độ toàn ứng dụng (Global configuration).
- `router/`: Cấu hình React Router.
    - `guards.tsx`: Chứa `PrivateRoute` (bảo vệ route cần đăng nhập) và `PublicRoute` (chặn user đã login vào trang Login/Register).
- `providers/`: Các Context Provider toàn cục.
    - `AuthProvider.tsx`: Quản lý trạng thái đăng nhập, thông tin User và JWT.
- `store/`: Quản lý state toàn cục (Redux, Zustand, v.v.).
- `index.tsx`: Entry point chính của ứng dụng.

### 2. `features/`
**CORE:** Logic nghiệp vụ chia theo domain. Mỗi feature là một folder độc lập:
- `auth/`: Xử lý đăng nhập, đăng ký, phân quyền.
    - `hooks/useAuth.ts`: Hook chính để truy cập thông tin user và hàm login/logout.
- `chat/`, `post/`, `user/`: Các tính năng khác của hệ thống.

### 3. `shared/`
Các thành phần dùng chung (Reusable assets).
- `components/`: UI components cơ bản (Button, Input, Modal).
- `hooks/`: Hooks tiện ích (useDebounce, useFetch).
- `utils/`: Hàm helper, format dữ liệu.

### 4. `services/`
Các dịch vụ dùng chung và tích hợp API.
- `api-client.ts`: Cấu hình Axios instance. 
    - **Request Interceptor**: Tự động đính kèm `Authorization: Bearer <token>` vào header.
    - **Response Interceptor**: Tự động xử lý lỗi `401 Unauthorized` (xóa token và redirect về trang login).

---

## Hệ thống Authentication (JWT)

Dự án sử dụng JWT để xác thực người dùng. Dưới đây là các điểm cần lưu ý:

### Cách sử dụng Auth Hook
Để lấy thông tin user hoặc thực hiện logout trong component:
```tsx
import { useAuth } from '@features/auth/hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  // ...
};
```

### Bảo vệ Route
Khi thêm một trang mới cần yêu cầu đăng nhập, hãy thêm vào `PrivateRoute` trong `src/app/router/index.tsx`:
```tsx
{
  element: <PrivateRoute />,
  children: [
    { path: '/dashboard', element: <DashboardPage /> }
  ]
}
```

### Quản lý Token
- **Lưu trữ**: Token được lưu trong `localStorage` với key `access_token`.
- **Hết hạn**: Khi API trả về lỗi 401, hệ thống sẽ tự động dọn dẹp bộ nhớ và đẩy người dùng về trang Login.

---

## 🎨 Cấu hình Tailwind CSS & Theme

Dự án sử dụng Tailwind CSS kết hợp với CSS Variables để quản lý giao diện linh hoạt (hỗ trợ Light/Dark mode).

### Theme Configuration
Các biến màu và font được định nghĩa trong `src/styles/global.css` và map vào `tailwind.config.js`. Bạn có thể sử dụng các utility class sau:

- **Colors**:
    - `text-background`, `bg-background`
    - `text-foreground`, `text-foreground-heading`
    - `border-border`
    - `bg-code`
    - `text-accent`, `bg-accent-bg`, `border-accent-border`
- **Fonts**:
    - `font-sans`, `font-heading`, `font-mono`
- **Shadow**:
    - `shadow-theme`

### Ví dụ sử dụng:
```tsx
<h1 className="text-foreground-heading font-heading text-4xl shadow-theme">
  Title Example
</h1>
```

---

## 🛠 Path Aliases

Sử dụng alias để code sạch hơn (Cấu hình tại `vite.config.ts` và `tsconfig.json`):
- `@app/*` -> `src/app/*`
- `@features/*` -> `src/features/*`
- `@shared/*` -> `src/shared/*`
- `@services/*` -> `src/services/*`
- `@assets/*` -> `src/assets/*`
- `@styles/*` -> `src/styles/*`

Ví dụ: `import { apiClient } from '@services/api-client';`
