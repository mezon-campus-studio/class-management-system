# EduAdmin Design System
## Modern Editorial × Humanist

> Tài liệu này dành cho **developer** và **AI agent** đọc để viết code đúng style.
> Đọc hết trước khi tạo component mới.

---

## 1. Triết lý thiết kế

| Thuộc tính | Quyết định |
|---|---|
| Phong cách | **Modern Editorial × Humanist** — tạp chí hiện đại, ấm áp, có hồn |
| Màu chủ đạo | **Ink-on-paper** — nền kem nhẹ, chữ warm-black, accent đất nung |
| Cảm giác | Đọc được, tin tưởng được, không lạnh lẽo như SaaS thông thường |
| KHÔNG làm | Viền màu 1 bên trên stat card, màu xanh/tím sặc sỡ làm tone chính, border-left accent |
| Dark mode | Class strategy: thêm `.dark` vào `<html>` |

### Công thức "Humanist"
- Font serif (Lora) cho **số liệu lớn và heading** — tạo cảm giác ấn phẩm in
- Màu nền **kem** (#FAFAF8) thay vì trắng thuần — mắt đỡ mỏi
- Chữ **warm-black** (#1C1917) thay vì #000 hay #111 — đọc tự nhiên hơn
- **Accent đất nung** (#C2714F) thay vì xanh dương generic
- Whitespace rộng rãi — Humanist typography ưu tiên nhịp thở

---

## 2. File structure

```
eduadmin-design-system/
├── tailwind.config.js   # Design tokens → Tailwind classes
├── globals.css          # CSS variables + @layer base/components
├── tokens.ts            # TypeScript tokens (dùng trong JS/JSX)
└── DESIGN-SYSTEM.md     # Tài liệu này
```

**Thứ tự setup:**
1. Copy 4 file trên vào project
2. Import `globals.css` vào root layout
3. Đảm bảo `tailwind.config.js` được trỏ đúng `content` paths
4. Dùng `tokens.ts` khi cần giá trị token trong TypeScript

---

## 3. Design Tokens

### 3.1 Colors

#### Paper scale (nền trang)
```
--bg-paper      #FAFAF8   nền trang chính (kem nhẹ — KHÔNG dùng trắng thuần cho body)
--bg-surface    #FFFFFF   card, panel, input
--bg-surface-2  #F5F4F1   thead, hover row, tab panel
--bg-surface-3  #EDEBE6   sunken, disabled, badge bg mặc định
```

#### Ink scale (chữ — warm tone, không lạnh)
```
--ink-1  #1C1917   primary text
--ink-2  #57534E   secondary text, body paragraph
--ink-3  #A8A29E   tertiary, placeholder, label
--ink-4  #D6D3D1   disabled, decorative, divider
```

#### Warm accent — màu accent chính
```
--warm-400   #C2714F   accent button, sidebar dot, pull-quote border
--warm-600   #A85A38   hover state
--warm-fill  #FBF0EC   pill background
--warm-text  #A85A38   pill text
--warm-border #F4C8B4  pill border
```

#### Semantic colors — dùng đúng ngữ nghĩa
| Biến | Fill | Text | Dùng khi |
|---|---|---|---|
| `--blue-*`  | #EEF4FE | #1E4FA8 | Info, primary action, "Khá", "Đang học" |
| `--green-*` | #EDFAF3 | #166534 | Success, "Tốt", "Xuất hiện", "Nộp bài" |
| `--amber-*` | #FFFBEB | #92400E | Warning, "Trung bình", "Chờ duyệt", "Đi muộn" |
| `--red-*`   | #FEF2F2 | #991B1B | Danger, "Yếu", "Vắng không phép", "Xoá" |
| `--sage-*`  | #F0F4EE | #3A5C36 | Special, "Xuất sắc", nổi bật tích cực |

#### Border (alpha — không hardcode hex)
```
--rule     rgba(0,0,0,0.08)   border mặc định
--rule-md  rgba(0,0,0,0.13)   border nhấn, focus ring base
--rule-lg  rgba(0,0,0,0.20)   border nặng (hiếm dùng)
```
**Lý do dùng alpha:** hoạt động đúng trên mọi màu nền, không cần viết lại cho dark mode.

### 3.2 Typography

#### Font stack
```
serif:   'Lora', Georgia, serif           → heading, display, số liệu lớn
sans:    'Plus Jakarta Sans', sans-serif  → body, UI, label
mono:    'JetBrains Mono', monospace      → code, MSSV, data thuần
```

#### Tailwind classes
```html
<!-- Display / Heading lớn -->
<h1 class="font-serif font-semibold text-5xl tracking-tightest text-ink-1">

<!-- Heading section -->
<h2 class="font-serif font-semibold text-3xl tracking-tighter text-ink-1">

<!-- Panel title -->
<h3 class="font-serif font-semibold text-xl tracking-tight text-ink-1">

<!-- Body -->
<p class="font-sans text-base leading-relaxed text-ink-2">

<!-- Label uppercase -->
<span class="font-sans text-2xs font-semibold tracking-label uppercase text-ink-3">

<!-- Code / ID -->
<span class="font-mono text-xs text-ink-3">SV2024001</span>
```

#### Scale quan trọng
| Class | Size | Dùng cho |
|---|---|---|
| `text-2xs` | 9.6px | Label uppercase, column header |
| `text-xs`  | 11.5px | Caption, timestamp, helper text |
| `text-sm`  | 13px   | Table cell phụ, badge text |
| `text-base`| 14px   | Body text, input, button |
| `text-lg`  | 16px   | Subtitle panel |
| `text-3xl` | 24px   | Heading section |
| `text-5xl` | 32px   | Display / hero |

### 3.3 Spacing (grid 4px)

```
Đơn vị 1 = 4px. Chỉ dùng bội số 4.
p-2 = 8px / p-3 = 12px / p-4 = 16px / p-6 = 24px / p-8 = 32px
```

### 3.4 Border radius
```
rounded-xs   2px   inline code, chip
rounded-sm   4px   tag nhỏ
rounded      8px   button, input (DEFAULT)
rounded-lg   10px  card, panel
rounded-xl   14px  modal, sheet lớn
rounded-full 9999px pill, avatar
```

### 3.5 Shadow
```
shadow-xs  → row hover, toggle
shadow-sm  → card elevated nhẹ
shadow-md  → dropdown, popover
shadow-lg  → modal
```
**Không dùng** shadow màu (color shadow) — chỉ dùng black/alpha.

---

## 4. Component Rules

### 4.1 Stat Card ⚠️ QUAN TRỌNG

**KHÔNG BAO GIỜ** dùng `border-left` màu trên stat card. Đây là pattern AI-generic.

```html
<!-- ✅ ĐÚNG — Editorial Humanist -->
<div class="stat-card">
  <div class="stat-label">Học sinh</div>
  <div class="stat-value">348</div>
  <div class="flex items-center gap-1.5">
    <span class="text-xs font-semibold text-green-text">▲ 4.2%</span>
    <span class="text-xs text-ink-3">tháng trước</span>
  </div>
</div>

<!-- ❌ SAI — đừng làm thế này -->
<div class="stat-card border-l-4 border-blue-500"> <!-- KHÔNG -->
<div class="stat-card" style="border-left: 4px solid #2A5FBF"> <!-- KHÔNG -->
```

Stat card lấy visual weight từ:
- Con số lớn bằng font serif
- Whitespace thoáng
- Trend indicator nhỏ (▲/▼ + màu semantic)

### 4.2 Buttons

```html
<!-- Primary — action chính -->
<button class="btn btn-primary">+ Thêm học sinh</button>

<!-- Warm — action thứ cấp quan trọng (tạo lớp, nổi bật) -->
<button class="btn btn-warm">▦ Tạo lớp mới</button>

<!-- Secondary — action trung tính -->
<button class="btn btn-secondary">◈ Nhập điểm</button>

<!-- Ghost — action ít quan trọng -->
<button class="btn btn-ghost">◧ Xuất báo cáo</button>

<!-- Danger — xoá, hành động nguy hiểm -->
<button class="btn btn-danger">Xoá lớp học</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Nhỏ</button>
<button class="btn btn-primary">Mặc định</button>
<button class="btn btn-primary btn-lg">Lớn</button>
```

### 4.3 Pill / Badge

Dùng `pill` + variant class. Chọn variant theo **ngữ nghĩa**, không theo màu thích.

```html
<span class="pill pill-green">
  <span class="pill-dot"></span>
  Đã nộp bài
</span>

<span class="pill pill-amber">
  <span class="pill-dot"></span>
  Chờ duyệt
</span>
```

| Trạng thái | Variant |
|---|---|
| Xuất sắc, đặc biệt | `pill-sage` |
| Tốt, đang học, có mặt, online | `pill-green` |
| Khá, đang xử lý, info | `pill-blue` |
| Trung bình, chờ, đi muộn | `pill-amber` |
| Yếu, vắng, lỗi, xoá | `pill-red` |
| Nổi bật, accent editorial | `pill-warm` |

### 4.4 Input

```html
<div class="input-wrap flex flex-col gap-1.5">
  <label class="input-label">Tên học sinh</label>
  <div class="input-field">
    <span class="text-sm text-ink-3">◉</span>
    <input placeholder="Nguyễn Văn An">
  </div>
  <span class="input-helper">Họ và tên đầy đủ</span>
</div>

<!-- Lỗi -->
<div class="input-wrap flex flex-col gap-1.5 input-error">
  <label class="input-label">Điểm số</label>
  <div class="input-field">
    <input value="11" placeholder="0–10">
    <span class="text-sm text-ink-3">/10</span>
  </div>
  <span class="input-error-msg">Điểm phải từ 0 đến 10</span>
</div>
```

### 4.5 Card / Panel

```html
<div class="card">
  <div class="card-header">
    <div>
      <div class="card-title">Danh sách học sinh</div>
      <div class="card-subtitle">Lớp 12A1 · hôm nay</div>
    </div>
    <button class="text-xs text-blue-text font-medium">Xem tất cả →</button>
  </div>
  <div class="card-body">
    <!-- nội dung -->
  </div>
  <div class="card-footer">
    <button class="btn btn-ghost btn-sm">Huỷ</button>
    <button class="btn btn-primary btn-sm">Lưu</button>
  </div>
</div>
```

### 4.6 Data Table

```html
<div class="overflow-x-auto">
  <table class="data-table">
    <thead>
      <tr>
        <th>Họ tên</th>
        <th>MSSV</th>
        <th>Điểm TB</th>
        <th>Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Nguyễn Văn An</td>
        <td><span class="font-mono text-xs text-ink-3">SV2024001</span></td>
        <td>8.5</td>
        <td><span class="pill pill-green"><span class="pill-dot"></span>Tốt</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

### 4.7 Sidebar

```html
<aside class="sidebar">
  <!-- Logo -->
  <div class="px-4 py-5 border-b border-sidebar-border">
    <div class="flex items-center gap-2.5">
      <div class="w-7 h-7 rounded-lg bg-sidebar-accent flex items-center justify-center
                  font-serif font-semibold text-white text-sm">E</div>
      <div>
        <div class="font-serif font-semibold text-white text-sm leading-tight">EduAdmin</div>
        <div class="text-2xs text-sidebar-text tracking-wide mt-0.5">Quản lí lớp học</div>
      </div>
    </div>
  </div>

  <!-- Nav items -->
  <nav class="flex-1 p-2.5 flex flex-col gap-0.5">
    <!-- Active -->
    <div class="sidebar-item active">
      <span class="text-base w-4 text-center opacity-100">⊞</span>
      Dashboard
      <span class="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-accent"></span>
    </div>
    <!-- Inactive -->
    <div class="sidebar-item">
      <span class="text-base w-4 text-center opacity-60">▦</span>
      Lớp học
    </div>
  </nav>
</aside>
```

### 4.8 Editorial Pull Quote (Humanist)

```html
<blockquote class="pull-quote">
  "Mỗi học sinh là một câu chuyện — hệ thống tốt giúp giáo viên hiểu từng câu chuyện đó."
  <footer class="mt-2 text-xs text-ink-3 font-medium not-italic">
    — Phương châm thiết kế EduAdmin
  </footer>
</blockquote>
```

### 4.9 Skeleton Loading

```html
<!-- Text skeleton -->
<div class="skeleton h-4 w-3/4 mb-2"></div>
<div class="skeleton h-4 w-1/2"></div>

<!-- Card skeleton -->
<div class="card p-4 space-y-3">
  <div class="skeleton h-3 w-24"></div>
  <div class="skeleton h-8 w-16"></div>
  <div class="skeleton h-3 w-32"></div>
</div>
```

---

## 5. Dark Mode

Dark mode dùng **class strategy**. Toggle bằng cách add/remove class `dark` trên `<html>`.

```tsx
// React example
function ThemeToggle() {
  const [dark, setDark] = useState(false);

  const toggle = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'light' : 'dark');
  };

  return <button onClick={toggle}>{dark ? '○ Light' : '● Dark'}</button>;
}

// Khởi tạo từ localStorage
useEffect(() => {
  if (localStorage.theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}, []);
```

**Các màu đổi tự động qua CSS variable** — code component không cần `dark:` class nếu đã dùng CSS variable. Chỉ cần thêm `dark:` Tailwind class khi Tailwind không có sẵn class tương ứng cho dark value.

---

## 6. Layout Patterns

### App shell
```html
<html class="dark"> <!-- hoặc không có class -->
<body>
  <div class="flex h-screen overflow-hidden">

    <!-- Sidebar — luôn dark dù theme gì -->
    <aside class="sidebar">...</aside>

    <!-- Main -->
    <div class="flex flex-col flex-1 overflow-hidden">

      <!-- Topbar -->
      <header class="h-[52px] bg-surface border-b border-rule flex items-center
                     justify-between px-6 shrink-0">...</header>

      <!-- Tab nav (optional) -->
      <nav class="flex border-b border-rule bg-surface px-6">...</nav>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto p-6 bg-paper scrollbar-thin">
        <div class="max-w-[900px] mx-auto">
          ...
        </div>
      </main>

    </div>
  </div>
</body>
```

### Dashboard stats row
```html
<div class="grid grid-cols-4 gap-[10px] mb-4">
  <div class="stat-card">...</div>
  <div class="stat-card">...</div>
  <div class="stat-card">...</div>
  <div class="stat-card">...</div>
</div>
```

### Two-column panel
```html
<div class="grid grid-cols-[1.7fr_1fr] gap-3">
  <div class="card"><!-- table --></div>
  <div class="flex flex-col gap-2.5">
    <div class="card"><!-- notifications --></div>
    <div class="card"><!-- teachers --></div>
  </div>
</div>
```

---

## 7. Quy tắc cho AI Agent

Khi AI agent viết component/page cho EduAdmin, **bắt buộc** tuân thủ:

### ✅ PHẢI làm
- Dùng CSS variable (`var(--ink-1)`) cho màu text/bg trong inline style
- Dùng `font-serif` / `font-sans` / `font-mono` từ Tailwind config
- Số liệu lớn (stat, metric) → `font-serif font-semibold` + `tracking-tightest`
- Label uppercase → `text-2xs font-semibold tracking-label uppercase text-ink-3`
- Border → `border border-rule` hoặc `border-[var(--rule)]`
- Pill/badge → chọn variant đúng ngữ nghĩa (xem bảng section 4.3)
- Input error → class `input-error` lên wrapper, KHÔNG đổi màu border thủ công
- Transition → `transition-fast` / `transition-base` / `transition-slow`

### ❌ KHÔNG được làm
- `border-l-4 border-blue-500` hoặc bất kỳ border-left màu nào trên stat card
- Màu hex hardcode trong JSX inline style (dùng CSS var hoặc Tailwind class)
- `text-gray-500` — dùng `text-ink-2` / `text-ink-3` thay thế
- `bg-white` cho trang — dùng `bg-paper` (nền kem)
- `shadow-blue-200` hay shadow màu
- `font-bold` với weight 700 cho heading UI thường — dùng `font-semibold`
- Emoji trong icon — dùng ký tự Unicode shape (◉ ▦ ⊞ ◈ ◐ ◧)
- `border-radius` khác với scale đã định nghĩa (2/4/8/10/14/9999px)

### Naming convention component
```
PascalCase   → React component:  StatCard, DataTable, PillBadge
kebab-case   → CSS class:        stat-card, data-table, pill-blue
camelCase    → TypeScript prop:  pillVariant, cardTitle, onToggle
SCREAMING    → Constant:         PILL_VARIANTS, STUDENT_STATUS
```

### Khi không biết dùng màu gì
Hỏi: "trạng thái này có nghĩa gì?"
- Tích cực rõ ràng → `green`
- Trung tính / info → `blue`
- Cảnh báo / cần chú ý → `amber`
- Lỗi / nguy hiểm → `red`
- Xuất sắc / đặc biệt → `sage`
- Accent editorial / nổi bật thương hiệu → `warm`

---

## 8. Quick Reference Card

```
FONT        Lora (serif display) + Plus Jakarta Sans (body) + JetBrains Mono
PAPER       #FAFAF8  (body bg — kem nhẹ)
SURFACE     #FFFFFF  (card bg)
INK-1       #1C1917  (text chính — warm black)
ACCENT      #C2714F  (warm 400 — đất nung)
INFO        #1E4FA8  (blue-text)
SUCCESS     #166534  (green-text)
WARNING     #92400E  (amber-text)
DANGER      #991B1B  (red-text)
SPECIAL     #3A5C36  (sage-text)
SIDEBAR     #1C1917  (luôn dark)

RADIUS      8px (button/input) · 10px (card) · 9999px (pill)
BORDER      rgba(0,0,0,0.08) (rule) · rgba(0,0,0,0.13) (rule-md)
SHADOW      0 4px 12px rgba(0,0,0,.10) (md)

STAT CARD   KHÔNG dùng border-left màu
PILL        Chọn variant theo ngữ nghĩa
INPUT ERROR class input-error lên wrapper div
DARK MODE   class="dark" trên <html>
```