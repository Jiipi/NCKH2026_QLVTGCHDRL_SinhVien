import React from 'react';
import { User, Hash, GraduationCap, Calendar, Mail, Phone, MapPin, Shield, CheckCircle, Clock, Crown } from 'lucide-react';
import { formatDateVN } from '../../../../../shared/lib/date';

/**
 * ProfileInfoSection Component - Section hiển thị thông tin profile
 */
export default function ProfileInfoSection({ 
  profile, 
  getGenderDisplay, 
  getStatusText 
}) {
  const renderField = (label, value, formatter, icon) => {
    const val = typeof formatter === 'function' ? formatter(value) : value;
    if (val === undefined || val === null || val === '') return null;
    return (
      <div className="flex items-start gap-3">
        {icon && <div className="text-gray-400 mt-1">{icon}</div>}
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-500">{label}</label>
          <p className="mt-1 text-sm text-gray-900">{val}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Thông tin sinh viên
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField('Họ và tên', profile?.ho_ten, null, <User className="h-4 w-4" />)}
          {renderField('MSSV', profile?.mssv, null, <Hash className="h-4 w-4" />)}
          {renderField('Lớp', profile?.lop, null, <GraduationCap className="h-4 w-4" />)}
          {renderField('Khoa', profile?.khoa, null, <GraduationCap className="h-4 w-4" />)}
          {renderField('Niên khóa', profile?.nienkhoa, null, <Calendar className="h-4 w-4" />)}
          {renderField('Ngày sinh', profile?.ngay_sinh, formatDateVN, <Calendar className="h-4 w-4" />)}
          {renderField('Giới tính', profile?.gt, getGenderDisplay, <User className="h-4 w-4" />)}
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-green-600" />
          Thông tin liên hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField('Email', profile?.email, null, <Mail className="h-4 w-4" />)}
          {renderField('Số điện thoại', profile?.sdt, null, <Phone className="h-4 w-4" />)}
          {renderField('Địa chỉ', profile?.dia_chi, null, <MapPin className="h-4 w-4" />)}
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          Thông tin tài khoản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField('Tên đăng nhập', profile?.ten_dn, null, <User className="h-4 w-4" />)}
          {renderField('Vai trò', 'Lớp trưởng', null, <Crown className="h-4 w-4" />)}
          {renderField('Trạng thái', profile?.trang_thai, getStatusText, <CheckCircle className="h-4 w-4" />)}
          {renderField('Ngày tạo', profile?.ngay_tao, formatDateVN, <Clock className="h-4 w-4" />)}
          {renderField('Lần đăng nhập cuối', profile?.lan_cuoi_dn, formatDateVN, <Clock className="h-4 w-4" />)}
        </div>
      </div>
    </div>
  );
}

