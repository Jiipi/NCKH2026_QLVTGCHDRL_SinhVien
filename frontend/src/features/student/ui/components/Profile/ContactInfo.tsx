import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const fields = [
  { label: 'Email', key: 'email', icon: Mail },
  { label: 'Số điện thoại', key: 'sdt', icon: Phone },
  { label: 'Địa chỉ', key: 'dia_chi', icon: MapPin }
];

export default function ContactInfo({ profile }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Phone className="h-5 w-5 text-blue-600" />
        Thông tin liên hệ
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(({ label, key, icon: Icon }) => {
          const value = profile?.[key];
          if (!value) return null;
          return (
            <div key={label} className="flex items-start gap-3">
              <Icon className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <label className="text-sm font-medium text-gray-500">{label}</label>
                <p className="mt-1 text-sm text-gray-900">{value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

