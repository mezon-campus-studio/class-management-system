# Code Conventions — ClassroomHub

---

## Backend (Java / Spring Boot)

### Package structure

Domain-Driven Design. Mỗi domain là một package độc lập:

```
com.classroomhub/
  config/          # Spring config beans (Security, JPA)
  common/          # Shared utilities: exception, response, security
  domain/
    auth/
      controller/
      dto/
      entity/
      repository/
      service/
    classroom/     # tương tự
    group/
    attendance/
```

### Naming

| Type | Convention | Example |
|------|-----------|---------|
| Class | PascalCase | `AuthService`, `ClassroomMember` |
| Method | camelCase | `buildAuthResponse()`, `requireMember()` |
| Constant | UPPER_SNAKE | `SECURE_RANDOM`, `INVITE_CODE_CHARS` |
| Table | snake_case | `classroom_members`, `refresh_tokens` |
| Column | snake_case | `created_at`, `family_id` |

### DTOs

- Dùng Java `record` cho tất cả DTOs.
- Request DTOs đặt annotation validation trực tiếp trên field của record.
- Response DTOs có static factory method `from(entity)` khi cần.

```java
// Đúng
public record CreateClassroomRequest(
    @NotBlank String name,
    @Size(max = 1000) String description
) {}

// Sai — không dùng class thông thường cho DTO
```

### Entity

- UUID primary key, generate bằng `@GeneratedValue(strategy = GenerationType.UUID)`.
- Timestamps dùng `Instant`, không dùng `LocalDateTime` (tránh timezone bug).
- `@EntityListeners(AuditingEntityListener.class)` cho `createdAt`, `updatedAt`.
- Không để business logic trong entity — chỉ data + enum.

### Service

- Tất cả public method đều có `@Transactional` hoặc `@Transactional(readOnly = true)`.
- Throw `BusinessException(ErrorCode.*)` khi vi phạm business rule.
- Helper method private, đặt dưới phần `// ─── Helpers ───`.
- Không inject `HttpServletRequest` vào service — lấy user qua `SecurityUtils.getCurrentUser()` ở controller.

### Controller

- `@PreAuthorize("isAuthenticated()")` ở class level thay vì từng method.
- Trả về `ApiResponse<T>` thống nhất.
- Không chứa business logic — chỉ extract user ID, gọi service, wrap response.

### Error handling

Tất cả lỗi đi qua `GlobalExceptionHandler`. Không bao giờ throw exception HTTP thuần từ service.

```java
// Đúng
throw new BusinessException(ErrorCode.CLASSROOM_NOT_FOUND);

// Sai
throw new ResponseStatusException(HttpStatus.NOT_FOUND, "...");
```

### Comments

Không comment giải thích WHAT code làm. Chỉ comment WHY khi cần:

```java
// Detect token reuse attack — nếu token USED bị replay, revoke toàn bộ family
if (stored.getStatus() == RefreshToken.Status.USED) { ... }
```

---

## Frontend (React / TypeScript)

### Cấu trúc feature

Mỗi feature trong `src/features/` gồm:

```
features/auth/
  api/index.ts       # Axios calls, trả về typed data (không trả raw AxiosResponse)
  pages/             # Page components (route-level)
  types/index.ts     # TypeScript types & constants cho domain này
  hooks/             # Custom hooks (nếu cần)
```

### Naming

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `LoginPage`, `Modal` |
| Function | camelCase | `handleSubmit`, `buildMemberResponses` |
| Type/Interface | PascalCase | `UserInfo`, `AttendanceRecord` |
| Constant | UPPER_SNAKE | `ROLE_LABELS`, `RECORD_STATUS_VARIANT` |
| File | kebab-case (tên file) hoặc PascalCase (component) | `api-client.ts`, `LoginPage.tsx` |

### Components

- Named export, không dùng `export default` cho components.
- Props interface đặt ngay trên component, không tách file riêng trừ khi dùng nhiều nơi.
- Không dùng `React.FC<Props>` — dùng `function Component(props: Props)`.

```tsx
// Đúng
interface ModalProps { open: boolean; onClose: () => void; }
export function Modal({ open, onClose }: ModalProps) { ... }

// Sai
const Modal: React.FC<ModalProps> = ({ open, onClose }) => { ... }
```

### State management

- **Server state** (data từ API): fetch trực tiếp với `useEffect` + `useState` trong component/page.
- **Global client state** (auth session): Zustand store trong `src/app/store/`.
- Không dùng Redux hay Context API cho server data.

### API calls

Tất cả calls đi qua `src/services/api-client.ts` (instance Axios với interceptor tự refresh token).
Feature API module chỉ gọi `api.get/post/...` và unwrap `response.data.data`:

```ts
// Đúng
export const classroomApi = {
  list: () => api.get<ApiResponse<Classroom[]>>('/classrooms').then(r => r.data.data),
};

// Sai — không gọi axios.create() hay fetch trực tiếp trong feature
```

### Error handling

Trong event handler (submit, click): `try/catch`, lấy message từ `error.response?.data?.message`.
Không dùng `alert()` — hiển thị inline error trong UI.

```tsx
try {
  await someApi.call();
} catch (err: unknown) {
  const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  setError(msg ?? 'Lỗi không xác định');
}
```

### Styling

- Dùng Tailwind utility classes + design system classes (`.btn`, `.card`, `.pill-*`, `.input-field`...).
- Màu sắc semantic dùng CSS variables (`var(--warm-400)`, `var(--red-text)`) thay vì hardcode hex.
- Không viết inline style trừ khi Tailwind không hỗ trợ (ví dụ: CSS variable động).

### TypeScript

- Không dùng `any`. Nếu type chưa biết, dùng `unknown` và narrow trước khi dùng.
- `type` cho union/intersection, `interface` cho object shape.
- Tất cả API response phải có type tường minh.

---

## Git

### Commit message

Format: `<type>: <mô tả ngắn>`

| Type | Khi nào dùng |
|------|-------------|
| `feat` | Tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Refactor không thêm feature / fix bug |
| `chore` | Config, build, deps |
| `docs` | Tài liệu |

Ví dụ: `feat: add refresh token rotation with abuse detection`

### Branch

- `main` — production-ready
- `feature/<tên>` — tính năng mới
- `fix/<tên>` — bug fix

Không push thẳng vào `main`. Tạo PR và review trước khi merge.
