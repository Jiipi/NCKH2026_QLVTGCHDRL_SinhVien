# 📄 Hướng Dẫn Phân Trang (Pagination)

## 🎯 Tổng Quan

Hệ thống phân trang đã được nâng cấp với UX hiện đại và đầy đủ tính năng cho trang danh sách hoạt động.

---

## ✨ Tính Năng Mới

### 1. **Hiển Thị Thông Tin Chi Tiết**
```
Hiển thị 1-20 trong 150 kết quả
```
- Cho biết đang xem từ item thứ mấy đến item thứ mấy
- Tổng số kết quả được highlight màu xanh
- Cập nhật real-time khi chuyển trang

### 2. **Tùy Chọn Số Items Trên Mỗi Trang**
```html
<select>
  <option>10</option>
  <option>20</option> ← Mặc định
  <option>50</option>
  <option>100</option>
</select>
```
- Dropdown dễ dùng
- Tự động reset về trang 1 khi thay đổi
- Tự động reload dữ liệu

### 3. **Navigation Buttons Đầy Đủ**

#### a) Nút Trang Đầu/Cuối
- **Trang đầu**: Icon double chevron left `<<`
- **Trang cuối**: Icon double chevron right `>>`
- Tự động disable khi đang ở trang tương ứng

#### b) Nút Trước/Sau
- **Trước**: Chuyển về trang trước đó
- **Sau**: Chuyển đến trang tiếp theo
- Disable khi không thể chuyển

### 4. **Smart Page Numbers**

#### Logic Thông Minh:
- **Ít trang (≤7)**: Hiển thị tất cả các trang
  ```
  [1] [2] [3] [4] [5]
  ```

- **Nhiều trang (>7)**: Hiển thị theo pattern:
  ```
  [1] ... [4] [5] [6] ... [15]
   ↑     ↑  ↑  ↑       ↑
   Đầu  Ellipsis Current Ellipsis Cuối
  ```

#### Quy Tắc:
- Luôn hiển thị trang đầu (1) và trang cuối
- Hiển thị 2 trang trước và 2 trang sau trang hiện tại
- Dấu `...` (ellipsis) xuất hiện khi có khoảng cách

### 5. **Visual Feedback Tuyệt Đẹp**

#### Active Page:
```css
- Gradient màu xanh-tím
- Shadow nổi bật
- Scale lớn hơn (110%)
- Ring border xanh
```

#### Hover Effects:
```css
- Background chuyển sang xanh nhạt
- Border chuyển màu xanh
- Shadow nâng cao
- Transition mượt mà
```

#### Disabled State:
```css
- Background xám nhạt
- Text màu xám
- Cursor not-allowed
- Không có hover effect
```

---

## 🎨 Design System

### Colors:
- **Primary**: Blue-600 → Indigo-600 (Gradient)
- **Hover**: Blue-50 background
- **Disabled**: Gray-100 background, Gray-400 text
- **Border**: Gray-200 (normal), Blue-300 (hover)

### Spacing:
- **Gap giữa buttons**: 8px (gap-2)
- **Padding button**: 16px 20px
- **Border radius**: 12px (rounded-xl)

### Typography:
- **Font weight**: Bold/Semibold
- **Current page**: Scale 110%
- **Info text**: Small (14px)

---

## 🔧 Technical Details

### Backend API:
```javascript
GET /activities?page=1&limit=20

Response:
{
  "items": [...],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### Frontend State:
```javascript
const [pagination, setPagination] = React.useState({
  page: 1,     // Current page (1-indexed)
  limit: 20,   // Items per page
  total: 0     // Total number of items
});
```

### Auto-reload Triggers:
```javascript
React.useEffect(() => {
  loadActivities();
}, [pagination.page, pagination.limit]);
```

### Smart Calculation:
```javascript
// First item index
const firstItem = (page - 1) * limit + 1;

// Last item index  
const lastItem = Math.min(page * limit, total);

// Total pages
const totalPages = Math.ceil(total / limit);
```

---

## 📱 Responsive Design

### Desktop (lg):
- Info và selector hiển thị trên 1 hàng
- Buttons có đủ padding và text
- Tất cả page numbers hiển thị

### Mobile:
- Info và selector xếp thành 2 hàng (flex-col)
- Buttons vẫn giữ được size tốt
- Page numbers wrap xuống dòng nếu cần (flex-wrap)

---

## 🚀 Usage Examples

### 1. Chuyển đến trang cụ thể:
```javascript
handlePageChange(5); // Chuyển đến trang 5
```

### 2. Thay đổi items per page:
```javascript
setPagination(prev => ({
  ...prev,
  limit: 50,  // Hiển thị 50 items
  page: 1     // Reset về trang 1
}));
```

### 3. Tính toán pagination info:
```javascript
// Hiển thị "41-60 trong 150 kết quả" (trang 3, limit 20)
const from = (3 - 1) * 20 + 1;      // 41
const to = Math.min(3 * 20, 150);   // 60
```

---

## 🎓 Best Practices

### 1. **Performance**
- Chỉ load data cần thiết cho trang hiện tại
- Sử dụng React.useEffect với đúng dependencies
- Tránh re-render không cần thiết

### 2. **UX**
- Luôn hiển thị tổng số kết quả
- Disable buttons khi không thể sử dụng
- Cung cấp feedback visual rõ ràng
- Cho phép jump đến trang đầu/cuối nhanh
- **ẨN phân trang khi không cần thiết** (≤ limit items)
- **ẨN dropdown khi ít items** (< 10 items)

### 3. **Accessibility**
- Title attributes cho buttons
- Proper disabled states
- Keyboard navigation support
- Clear visual hierarchy

### 4. **Smart Display Logic**
```javascript
// Ẩn pagination buttons khi tất cả items vừa 1 trang
{pagination.total > pagination.limit && (
  // Hiển thị buttons
)}

// Ẩn dropdown khi không cần
{pagination.total > 10 && (
  // Hiển thị dropdown
)}

// Text khác nhau tùy trường hợp
{pagination.total <= pagination.limit ? (
  "Hiển thị tất cả X kết quả"
) : (
  "Hiển thị 1-20 trong X kết quả"
)}
```

---

## 🐛 Troubleshooting

### Issue: Pagination không hiển thị
**Solution**: Kiểm tra `pagination.total > pagination.limit`

### Issue: Page numbers không đúng
**Solution**: Đảm bảo backend trả về đúng `total`

### Issue: Không reload khi thay đổi limit
**Solution**: Kiểm tra useEffect dependencies có `pagination.limit`

---

## 📊 Screenshots

### Case 1: Nhiều trang (>20 items, limit=20)
```
┌────────────────────────────────────────────────────────────┐
│ Hiển thị 1-20 trong 150 kết quả    Hiển thị mỗi trang: [20▼]│
│                                                              │
│  [<<] [< Trước] [1] ... [3] [4] [●5] [6] [7] ... [15] [Sau >] [>>] │
└────────────────────────────────────────────────────────────┘
```

### Case 2: Ít items (≤20 items, limit=20)
```
┌────────────────────────────────────────┐
│ Có 11 hoạt động lớp của bạn [✓ Hiển thị đầy đủ] │
│                                        │
│ Hiển thị tất cả 11 kết quả             │
│ (Không có dropdown, không có buttons)  │
└────────────────────────────────────────┘
```

### Case 3: Có nhiều items nhưng chỉ vừa 1 trang (11-20 items)
```
┌────────────────────────────────────────────────┐
│ Có 15 hoạt động lớp của bạn [✓ Hiển thị đầy đủ]│
│                                                │
│ Hiển thị tất cả 15 kết quả  [Dropdown visible] │
└────────────────────────────────────────────────┘
```

### Mobile View:
```
┌──────────────────────────┐
│ Hiển thị 1-20 trong 150  │
│ Hiển thị mỗi trang: [20▼]│
│                          │
│ [<<] [< Trước] [1] ...   │
│ [3] [4] [●5] [6] [7] ... │
│ [15] [Sau >] [>>]        │
└──────────────────────────┘
```

---

## 🎉 Benefits

✅ **Improved UX**: Người dùng biết rõ đang ở đâu
✅ **Flexibility**: Tùy chọn số items per page
✅ **Navigation**: Dễ dàng jump đến trang bất kỳ
✅ **Performance**: Chỉ load data cần thiết
✅ **Responsive**: Hoạt động tốt trên mọi thiết bị
✅ **Modern Design**: Phù hợp với design system hiện tại

---

**Created**: 2025-01-07
**Version**: 2.0
**Author**: AI Assistant

