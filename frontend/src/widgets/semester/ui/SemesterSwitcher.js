import React from 'react';
import useSemesterData from '../../../shared/hooks/useSemesterData';

export default function SemesterFilter({ value, onChange, label = 'Học kỳ', className = '', options: propOptions }) {
  const { options: hookOptions, loading } = useSemesterData();
  
  // Sử dụng options từ props nếu có, nếu không thì dùng từ hook
  const options = propOptions || hookOptions || [];
  
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading && !propOptions}
      >
        {options.map((o, index) => (
          <option key={`${o.value ?? 'blank'}-${index}`} value={o.value ?? ''}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}


