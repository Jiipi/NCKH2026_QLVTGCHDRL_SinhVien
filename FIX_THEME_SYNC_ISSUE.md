# Fix Lỗi Chế Độ Sáng/Tối Bị Đồng Bộ Giữa Các Tab

## ❌ Vấn đề:

Khi người dùng mở **nhiều tab** trong trình duyệt:
- **Tab 1:** Đổi sang chế độ tối (dark mode)
- **Tab 2:** Tự động chuyển sang chế độ tối (không mong muốn)
- **Tab 3:** Cũng bị đồng bộ sang chế độ tối

→ **Nguyên nhân:** Dùng `localStorage` để lưu theme → Tất cả tab chia sẻ chung theme

---

## 🔍 Phân tích nguyên nhân:

### Code CŨ (Lỗi):

**File:** `frontend/src/components/ModernHeader.js`

```javascript
// ❌ Dùng localStorage - chia sẻ giữa TẤT CẢ các tab
const [theme, setTheme] = React.useState(() => {
  return localStorage.getItem('theme') || 'light';  // ← LỖI: localStorage đồng bộ giữa các tab
});

React.useEffect(() => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);  // ← LỖI: Tất cả tab đều đọc giá trị này
}, [theme]);
```

### Tại sao lỗi?

| Storage Type | Phạm vi | Hành vi |
|--------------|---------|---------|
| `localStorage` | **Toàn bộ domain** | Chia sẻ giữa **TẤT CẢ tab/window** cùng domain |
| `sessionStorage` | **Mỗi tab riêng** | **Mỗi tab** có dữ liệu riêng biệt |

**Ví dụ thực tế:**
1. User mở `http://localhost:3000` ở **Tab A** → Chế độ sáng (light)
2. User mở `http://localhost:3000` ở **Tab B** → Chế độ sáng (light) - đọc từ `localStorage`
3. User bật chế độ tối ở **Tab A** → `localStorage.setItem('theme', 'dark')`
4. **Tab B** tự động đồng bộ → Cũng chuyển sang chế độ tối ❌

---

## ✅ Giải pháp:

### Chuyển từ `localStorage` → `sessionStorage`

**Code MỚI (Đúng):**

```javascript
// ✅ Dùng sessionStorage - mỗi tab độc lập
const [theme, setTheme] = React.useState(() => {
  // Mỗi tab có theme riêng, không đồng bộ giữa các tab
  return sessionStorage.getItem('theme') || 'light';  // ✅ sessionStorage: mỗi tab riêng
});

React.useEffect(() => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  // Lưu vào sessionStorage thay vì localStorage để mỗi tab riêng biệt
  sessionStorage.setItem('theme', theme);  // ✅ Chỉ lưu cho tab hiện tại
}, [theme]);
```

---

## 📊 So sánh trước và sau:

### ❌ Trước (localStorage):
```
┌─────────────┐      ┌─────────────────────────┐      ┌─────────────┐
│   Tab A     │      │   localStorage          │      │   Tab B     │
│             │◀─────┤   theme: "dark"         │─────▶│             │
│  Dark Mode  │      │   (SHARED)              │      │  Dark Mode  │
└─────────────┘      └─────────────────────────┘      └─────────────┘
                               ▲
                               │ Tất cả tab đọc chung
                               └─────────────────────────┐
                                                         │
                                                   ┌─────────────┐
                                                   │   Tab C     │
                                                   │  Dark Mode  │
                                                   └─────────────┘
```
→ **Vấn đề:** Tab A đổi theme → Tab B, C tự động đổi theo (không mong muốn)

---

### ✅ Sau (sessionStorage):
```
┌─────────────┐      ┌─────────────────────────┐
│   Tab A     │      │   sessionStorage (Tab A)│
│             │◀─────┤   theme: "dark"         │
│  Dark Mode  │      └─────────────────────────┘
└─────────────┘

┌─────────────┐      ┌─────────────────────────┐
│   Tab B     │      │   sessionStorage (Tab B)│
│             │◀─────┤   theme: "light"        │
│  Light Mode │      └─────────────────────────┘
└─────────────┘

┌─────────────┐      ┌─────────────────────────┐
│   Tab C     │      │   sessionStorage (Tab C)│
│             │◀─────┤   theme: "light"        │
│  Light Mode │      └─────────────────────────┘
└─────────────┘
```
→ **Giải pháp:** Mỗi tab độc lập, không ảnh hưởng lẫn nhau ✅

---

## 🧪 Cách test:

### Test Case 1: Theme độc lập giữa các tab
1. **Mở Tab A:** `http://localhost:3000/login`
2. **Kiểm tra:** Chế độ sáng (mặc định)
3. **Click icon Mặt trăng (Moon)** → Chuyển sang chế độ tối
4. **Mở Tab B (cùng URL):** `http://localhost:3000/login`
5. **Kiểm tra Tab B:** Vẫn chế độ sáng ✅ (không bị đồng bộ từ Tab A)
6. **Quay lại Tab A:** Vẫn chế độ tối ✅ (giữ nguyên state của tab)

---

### Test Case 2: Theme giữ nguyên khi refresh trong cùng tab
1. **Tab A:** Bật chế độ tối
2. **Refresh Tab A (F5)**
3. **Kiểm tra:** Vẫn chế độ tối ✅ (đọc từ `sessionStorage` của tab hiện tại)

---

### Test Case 3: Theme reset khi mở tab mới
1. **Tab A:** Bật chế độ tối
2. **Mở Tab B (tab mới hoàn toàn)**
3. **Kiểm tra Tab B:** Chế độ sáng (mặc định) ✅ (tab mới không có sessionStorage)
4. **Bật chế độ tối ở Tab B**
5. **Kiểm tra Tab A:** Vẫn chế độ tối ✅ (không bị ảnh hưởng)

---

### Test Case 4: Multi-role scenario (Admin + Student)
1. **Tab A:** Đăng nhập `admin` → Bật chế độ tối
2. **Tab B:** Đăng nhập `sinh viên SV000001` → Vẫn chế độ sáng ✅
3. **Tab C:** Đăng nhập `giảng viên` → Vẫn chế độ sáng ✅

→ **Kết quả:** Mỗi tab có theme riêng, không ảnh hưởng lẫn nhau

---

## 🔧 Files đã sửa:

### 1. `frontend/src/components/ModernHeader.js`

**Thay đổi:**
- Line 33-35: `localStorage.getItem('theme')` → `sessionStorage.getItem('theme')`
- Line 74: `localStorage.setItem('theme', theme)` → `sessionStorage.setItem('theme', theme)`
- Thêm comment giải thích tại sao dùng sessionStorage

**Commit message:**
```
fix(theme): Separate theme state per tab using sessionStorage

- Changed from localStorage to sessionStorage for theme storage
- Each browser tab now maintains its own theme preference
- Prevents unwanted theme synchronization across tabs
- Fixes issue where changing theme in one tab affected all other tabs
```

---

## 📝 Lưu ý quan trọng:

### 1. **Hành vi mới:**
- **Mỗi tab** có theme riêng biệt
- **Refresh tab:** Theme được giữ nguyên (đọc từ sessionStorage)
- **Mở tab mới:** Theme reset về mặc định (light mode)
- **Đóng tab:** sessionStorage bị xóa, không ảnh hưởng tab khác

### 2. **Trade-offs:**
| Ưu điểm | Nhược điểm |
|---------|-----------|
| ✅ Mỗi tab độc lập | ⚠️ Theme không được nhớ khi đóng toàn bộ trình duyệt |
| ✅ Không bị đồng bộ nhầm | ⚠️ Tab mới luôn mặc định light mode |
| ✅ Phù hợp multi-user testing | |
| ✅ Tránh conflict giữa các role | |

### 3. **Nếu muốn theme được nhớ giữa các session:**

**Option A: Dùng cả localStorage + sessionStorage (Hybrid)**
```javascript
const [theme, setTheme] = React.useState(() => {
  // Ưu tiên sessionStorage (tab hiện tại), fallback sang localStorage (preference chung)
  return sessionStorage.getItem('theme') || localStorage.getItem('theme') || 'light';
});

React.useEffect(() => {
  sessionStorage.setItem('theme', theme);  // Lưu cho tab hiện tại
  localStorage.setItem('theme', theme);    // Lưu preference chung
}, [theme]);
```

**Option B: Dùng backend API**
```javascript
// Lưu theme preference vào database theo user
await http.put('/users/preferences', { theme });
```

**👉 Hiện tại đang dùng giải pháp đơn giản nhất (sessionStorage only)** để tránh đồng bộ nhầm giữa các tab.

---

## ✅ Checklist:

- [x] Chuyển `localStorage.getItem('theme')` → `sessionStorage.getItem('theme')`
- [x] Chuyển `localStorage.setItem('theme', theme)` → `sessionStorage.setItem('theme', theme)`
- [x] Thêm comment giải thích rõ ràng
- [x] Test chế độ sáng/tối độc lập giữa các tab
- [x] Test refresh tab giữ nguyên theme
- [x] Test tab mới reset về light mode
- [x] Tài liệu hướng dẫn chi tiết

---

## 🆘 Nếu vẫn gặp lỗi:

### Lỗi 1: Theme vẫn đồng bộ giữa các tab
**Nguyên nhân:** Cache trình duyệt chưa clear

**Giải pháp:**
```bash
# Clear cache và hard reload
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Lỗi 2: Theme bị mất khi refresh
**Nguyên nhân:** sessionStorage bị clear do lỗi code

**Kiểm tra:**
```javascript
// Mở DevTools Console
console.log('Current theme:', sessionStorage.getItem('theme'));

// Test set theme
sessionStorage.setItem('theme', 'dark');
console.log('After set:', sessionStorage.getItem('theme'));
```

### Lỗi 3: Dark mode không apply CSS
**Nguyên nhân:** Tailwind dark mode chưa config đúng

**Kiểm tra `tailwind.config.js`:**
```javascript
module.exports = {
  darkMode: 'class',  // ✅ Phải là 'class', không phải 'media'
  // ...
}
```

---

## 📚 Tham khảo:

- [MDN: sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [MDN: localStorage vs sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)

