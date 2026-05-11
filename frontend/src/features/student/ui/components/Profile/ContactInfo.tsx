import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const fields = [
  { label: 'Email', key: 'email', icon: Mail },
  { label: 'Số điện thoại', key: 'sdt', icon: Phone },
  { label: 'Địa chỉ', key: 'dia_chi', icon: MapPin }
];

export default function ContactInfo({ profile }) {
  return (
    <section className="space-y-6 rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
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

