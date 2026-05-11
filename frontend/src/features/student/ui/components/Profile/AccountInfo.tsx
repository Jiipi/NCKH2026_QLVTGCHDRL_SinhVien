import React from 'react';
import { Shield, User, Calendar, Clock, CheckCircle } from 'lucide-react';

const fields = [
  { label: 'Tên đăng nhập', key: 'username', icon: User },
  { label: 'Vai trò', key: 'role', icon: Shield },
  { label: 'Ngày tạo', key: 'createdAt', icon: Calendar },
  { label: 'Cập nhật cuối', key: 'updatedAt', icon: Clock },
  { label: 'Lần đăng nhập cuối', key: 'lastLogin', icon: Clock },
  { label: 'Trạng thái tài khoản', key: 'status', icon: CheckCircle }
];

export default function AccountInfo({ profile, formatDateVN, getStatusText }) {
  const getValue = (key) => {
    switch (key) {
      case 'username':
        return profile?.ten_dn || profile?.maso;
      case 'role':
        return profile?.roleLabel || profile?.vai_tro?.ten_vt;
      case 'createdAt':
        return profile?.ngay_tao || profile?.createdAt
          ? formatDateVN(profile?.ngay_tao || profile?.createdAt)
          : null;
      case 'updatedAt':
        return profile?.ngay_cap_nhat || profile?.updatedAt
          ? formatDateVN(profile?.ngay_cap_nhat || profile?.updatedAt)
          : null;
      case 'lastLogin':
        return profile?.lan_cuoi_dn
          ? formatDateVN(profile?.lan_cuoi_dn)
          : null;
      case 'status':
        return getStatusText(profile?.trang_thai || profile?.trangthai);
      default:
        return null;
    }
  };

  return (
    <section className="space-y-6 rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
        <Shield className="h-5 w-5 text-blue-600" />
        Thông tin tài khoản
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(({ label, key, icon: Icon }) => {
          const value = getValue(key);
          if (!value) return null;
          return (
            <div key={key} className="flex items-start gap-3">
              <Icon className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</label>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

