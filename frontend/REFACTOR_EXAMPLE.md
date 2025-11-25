# Ví dụ Refactor - Áp dụng 3 Tầng Architecture

## 📋 Phân tích code hiện tại

### Code hiện tại - Vấn đề

#### 1. Component có logic nghiệp vụ (Tầng 1 lẫn Tầng 2)

**File**: `src/features/activities/components/ActivityCard.js`

```javascript
// ❌ VẤN ĐỀ: Component có logic nghiệp vụ
export function ActivityCard({ activity, mode = 'grid', onRegister, onViewDetail, isWritable, role }) {
  // ❌ Logic nghiệp vụ trong component
  const canRegister = activity.trang_thai === 'da_duyet' && 
                      !activity.is_registered && 
                      !isDeadlinePast && 
                      !isPast;
  
  const canCancel = activity.is_registered && 
                    activity.registration_status === 'cho_duyet';
  
  // ❌ Logic quyết định hiển thị dựa trên role
  const showEditButton = isWritable && (role === 'GIANG_VIEN' || role === 'LOP_TRUONG');
  
  return (
    <div>
      {/* UI rendering */}
    </div>
  );
}
```

**Vấn đề**:
- Component chứa logic nghiệp vụ (`canRegister`, `canCancel`)
- Logic permission/role nằm trong component
- Khó test và tái sử dụng

#### 2. Hook gọi API trực tiếp (Tầng 2 lẫn Tầng 3)

**File**: `src/features/qr-attendance/hooks/useLegacyQRScanner.js`

```javascript
// ❌ VẤN ĐỀ: Hook gọi API trực tiếp
export function useLegacyQRScanner() {
  const processQRCode = async (qrData) => {
    // ❌ Gọi API trực tiếp trong hook
    const qrRes = await http.get(`/activities/${payload.activityId}/qr-data`);
    const checkinRes = await http.post(`/activities/${payload.activityId}/attendance/scan`, { token: payload.token });
  };
}
```

**Vấn đề**:
- Hook gọi API trực tiếp thay vì qua service
- Khó thay đổi API endpoint
- Khó mock khi test

## ✅ Giải pháp - Refactor theo 3 tầng

### Bước 1: Tạo Service Layer (Tầng 3)

**File mới**: `src/features/qr-attendance/services/qrAttendanceApi.js`

```javascript
// ✅ Tầng 3: Chỉ gọi API
import http from '../../../shared/api/http';

export const qrAttendanceApi = {
  /**
   * Lấy QR data của activity
   */
  async getQRData(activityId) {
    try {
      const res = await http.get(`/core/activities/${activityId}/qr-data`);
      return {
        success: true,
        data: res?.data?.data || res?.data || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Không lấy được mã QR'
      };
    }
  },

  /**
   * Quét QR code để điểm danh
   */
  async scanAttendance(activityId, token) {
    try {
      const res = await http.post(`/core/activities/${activityId}/attendance/scan`, { token });
      return {
        success: true,
        data: res?.data?.data || res?.data || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Điểm danh thất bại'
      };
    }
  }
};
```

### Bước 2: Tạo Business Logic Layer (Tầng 2)

**File mới**: `src/features/activities/model/hooks/useActivityPermissions.js`

```javascript
// ✅ Tầng 2: Business Logic - Permission
import { useMemo } from 'react';

/**
 * Hook xử lý logic permission cho activity
 */
export function useActivityPermissions(activity, userRole) {
  const permissions = useMemo(() => {
    const now = new Date();
    const startDate = activity.ngay_bd ? new Date(activity.ngay_bd) : null;
    const endDate = activity.ngay_kt ? new Date(activity.ngay_kt) : null;
    const deadline = activity.han_dk ? new Date(activity.han_dk) : null;
    
    const isPast = endDate && endDate < now;
    const isDeadlinePast = deadline && deadline < now;
    const isAfterStart = startDate && now >= startDate;
    
    // Business logic: Quyết định có thể đăng ký không
    const canRegister = activity.trang_thai === 'da_duyet' && 
                        !activity.is_registered && 
                        !isDeadlinePast && 
                        !isPast;
    
    // Business logic: Quyết định có thể hủy đăng ký không
    const canCancel = activity.is_registered && 
                      activity.registration_status === 'cho_duyet';
    
    // Business logic: Quyết định có thể chỉnh sửa không
    const canEdit = (userRole === 'GIANG_VIEN' || userRole === 'LOP_TRUONG' || userRole === 'ADMIN') &&
                    activity.trang_thai !== 'ket_thuc';
    
    // Business logic: Quyết định có thể xóa không
    const canDelete = (userRole === 'GIANG_VIEN' || userRole === 'LOP_TRUONG' || userRole === 'ADMIN') &&
                      activity.trang_thai === 'cho_duyet';
    
    return {
      canRegister,
      canCancel,
      canEdit,
      canDelete,
      isPast,
      isDeadlinePast,
      isAfterStart
    };
  }, [activity, userRole]);
  
  return permissions;
}
```

**File mới**: `src/features/qr-attendance/model/hooks/useQRScanner.js`

```javascript
// ✅ Tầng 2: Business Logic - QR Scanner
import { useState, useRef } from 'react';
import { qrAttendanceApi } from '../../services/qrAttendanceApi';
import { useNotification } from '../../../contexts/NotificationContext';

/**
 * Hook xử lý logic quét QR code
 */
export function useQRScanner() {
  const { showSuccess, showError } = useNotification();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  
  /**
   * Xử lý QR code đã quét
   */
  const processQRCode = async (qrData) => {
    try {
      // Parse QR data
      let payload = null;
      try {
        payload = JSON.parse(qrData);
      } catch (_) {
        const jsonStart = qrData.indexOf('{');
        const jsonEnd = qrData.lastIndexOf('}');
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          payload = JSON.parse(qrData.slice(jsonStart, jsonEnd + 1));
        }
      }
      
      if (!payload || !payload.activityId || !payload.token) {
        throw new Error('Mã QR không hợp lệ');
      }
      
      // Business logic: Validate token
      const qrRes = await qrAttendanceApi.getQRData(payload.activityId);
      if (!qrRes.success) {
        throw new Error(qrRes.error || 'Không lấy được mã QR');
      }
      
      const serverToken = qrRes.data.qr_token || qrRes.data.token;
      if (!serverToken || serverToken !== payload.token) {
        throw new Error('Mã QR không khớp hoặc đã hết hạn');
      }
      
      // Business logic: Scan attendance
      const checkinRes = await qrAttendanceApi.scanAttendance(payload.activityId, payload.token);
      if (!checkinRes.success) {
        throw new Error(checkinRes.error || 'Điểm danh thất bại');
      }
      
      setScanResult({
        success: true,
        message: 'Điểm danh thành công!',
        data: checkinRes.data
      });
      showSuccess('Điểm danh thành công');
      
    } catch (err) {
      const errorMessage = err.message || 'Không thể xác thực mã QR';
      setError(errorMessage);
      setScanResult({
        success: false,
        message: errorMessage
      });
      showError(errorMessage);
    }
  };
  
  return {
    isScanning,
    scanResult,
    error,
    processQRCode,
    setIsScanning
  };
}
```

### Bước 3: Refactor UI Component (Tầng 1)

**File refactor**: `src/features/activities/ui/ActivityCard.jsx`

```javascript
// ✅ Tầng 1: Chỉ hiển thị UI
import React from 'react';
import { useActivityPermissions } from '../model/hooks/useActivityPermissions';

/**
 * Component hiển thị activity card
 * Chỉ nhận props và render, không có logic nghiệp vụ
 */
export function ActivityCard({ 
  activity, 
  mode = 'grid', 
  onRegister, 
  onViewDetail,
  onEdit,
  onDelete,
  userRole 
}) {
  // ✅ Gọi hook từ Tầng 2 để lấy permissions
  const { canRegister, canCancel, canEdit, canDelete } = useActivityPermissions(activity, userRole);
  
  return (
    <div className="activity-card">
      <h3>{activity.ten_hd}</h3>
      <p>{activity.mo_ta}</p>
      
      {/* ✅ Chỉ render dựa trên permissions từ hook */}
      {canRegister && (
        <button onClick={() => onRegister(activity.id)}>
          Đăng ký
        </button>
      )}
      
      {canCancel && (
        <button onClick={() => onCancel(activity.id)}>
          Hủy đăng ký
        </button>
      )}
      
      {canEdit && (
        <button onClick={() => onEdit(activity.id)}>
          Chỉnh sửa
        </button>
      )}
      
      {canDelete && (
        <button onClick={() => onDelete(activity.id)}>
          Xóa
        </button>
      )}
      
      <button onClick={() => onViewDetail(activity.id)}>
        Xem chi tiết
      </button>
    </div>
  );
}
```

**File refactor**: `src/features/qr-attendance/ui/QRScannerPage.jsx`

```javascript
// ✅ Tầng 1: Chỉ hiển thị UI
import React from 'react';
import { useQRScanner } from '../model/hooks/useQRScanner';

/**
 * Page hiển thị QR scanner
 * Chỉ render UI, logic được xử lý bởi hook
 */
export function QRScannerPage() {
  // ✅ Gọi hook từ Tầng 2
  const { 
    isScanning, 
    scanResult, 
    error, 
    processQRCode, 
    setIsScanning 
  } = useQRScanner();
  
  return (
    <div className="qr-scanner-page">
      <h1>Quét QR Code</h1>
      
      {isScanning && (
        <div className="scanner-view">
          {/* Camera view */}
        </div>
      )}
      
      {scanResult && (
        <div className={`result ${scanResult.success ? 'success' : 'error'}`}>
          {scanResult.message}
        </div>
      )}
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
    </div>
  );
}
```

## 📊 So sánh Trước và Sau

### Trước (Lẫn lộn tầng)

```
ActivityCard.js
├── ❌ Logic nghiệp vụ (canRegister, canCancel)
├── ❌ Logic permission (role check)
└── ✅ UI rendering

useLegacyQRScanner.js
├── ❌ Gọi API trực tiếp (http.get, http.post)
├── ✅ Business logic (parse QR, validate)
└── ✅ State management
```

### Sau (Tách rõ 3 tầng)

```
Tầng 1: ActivityCard.jsx
└── ✅ Chỉ render UI
    └── Gọi useActivityPermissions() từ Tầng 2

Tầng 2: useActivityPermissions.js
└── ✅ Business logic (permission rules)
    └── Gọi qrAttendanceApi từ Tầng 3

Tầng 3: qrAttendanceApi.js
└── ✅ Chỉ gọi API
```

## 🎯 Lợi ích

1. **Dễ test**: Test từng tầng độc lập
2. **Dễ maintain**: Thay đổi API không ảnh hưởng UI
3. **Tái sử dụng**: Business logic dùng ở nhiều UI
4. **Consistency**: Đồng nhất với backend

## 📝 Checklist Refactor

- [ ] Tạo service layer (Tầng 3) cho mỗi feature
- [ ] Di chuyển tất cả API calls vào services
- [ ] Tạo business hooks (Tầng 2) cho logic nghiệp vụ
- [ ] Refactor components (Tầng 1) chỉ render UI
- [ ] Test từng tầng độc lập
- [ ] Update documentation

