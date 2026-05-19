# Skill: StudentPageHero — Shared Hero Card Component

## Mục đích
`StudentPageHero` là component chung duy nhất cho tất cả header card trên các trang sinh viên. Khi thêm page mới cho sinh viên, **luôn sử dụng component này** thay vì tạo header riêng.

## Import
```tsx
import { StudentPageHero } from '../../../shared/components/student';
// hoặc tùy theo vị trí relative
import { StudentPageHero } from '../../../../shared/components/student';
```

## Các Props

| Prop | Type | Mô tả |
|------|------|--------|
| `eyebrow` | `string` | Text nhỏ phía trên title. Ví dụ: "Không gian sinh viên" |
| `title` | `string` | Tiêu đề chính trang |
| `description` | `string` | Mô tả ngắn |
| `chips` | `Array<{ icon, label }>` | Tags stat nhỏ ngang hàng (mode mặc định) |
| `metrics` | `Array<{ icon, label, value, tone? }>` | Card metric lớn (mode thay thế — Certificates) |
| `badge` | `{ icon, label }` | Badge pill hiện trên title (thay thế eyebrow) |
| `heroIcon` | `React.ElementType` | Icon lớn bên trái text (kiểu QR Scanner) |
| `actions` | `React.ReactNode` | Cụm nút/chip thao tác bên phải, dùng cho các trang có nút xuất file/tạo mới/lịch sử |

## Các Variant Sử Dụng

### 1. Chips Mode (Mặc định)
Dùng cho: Activities, My Activities, Scores, Activity Detail
```tsx
<StudentPageHero
  eyebrow="Không gian sinh viên"
  title="Danh sách hoạt động"
  description="Khám phá hoạt động phù hợp..."
  chips={[
    { icon: Calendar, label: '105 hoạt động' },
    { icon: Sparkles, label: '0 sắp diễn ra' },
    { icon: Trophy, label: '76/100 điểm' },
  ]}
/>
```

### 2. Metrics Mode (Card lớn)
Dùng cho: Certificates
```tsx
<StudentPageHero
  eyebrow="Không gian sinh viên"
  title="Chứng nhận của tôi"
  description="Tổng hợp các chứng nhận hoạt động đã hoàn thành."
  badge={{ icon: ShieldCheck, label: 'Hồ sơ chứng nhận' }}
  metrics={[
    { icon: Award, label: 'Chứng nhận', value: 27, tone: 'text-indigo-600 dark:text-indigo-300' },
    { icon: Trophy, label: 'Tổng điểm', value: '243.0', tone: 'text-amber-600 dark:text-amber-300' },
  ]}
/>
```

### 3. Hero Icon Mode (Icon lớn bên trái)
Dùng cho: QR Scanner / Điểm danh
```tsx
<StudentPageHero
  eyebrow="Không gian lớp trưởng"
  title="Điểm danh hoạt động"
  description="Chọn phương thức điểm danh phù hợp..."
  heroIcon={Fingerprint}
  chips={[
    { icon: QrCode, label: 'Quét QR' },
    { icon: Camera, label: 'Khuôn mặt' },
  ]}
/>
```

## Quy tắc
1. **KHÔNG copy-paste hero** — luôn import từ `shared/components/student`
2. Khi thêm trang mới, chọn variant phù hợp (chips/metrics/heroIcon)
3. Trang Dashboard và Profile có hệ thống hero riêng, không dùng component này
4. Nếu có `metrics` và `actions`, không tách nút ra mép phải; truyền qua prop `actions` để component gom vào panel bên phải cùng metrics.
5. Metrics phải nằm trong panel chung, tự đổi grid theo số lượng để tránh card nhỏ bị trôi giữa hero.

## File Location
```
frontend/src/shared/components/student/
├── StudentPageHero.tsx   # Component chính
└── index.ts              # Barrel export
```
