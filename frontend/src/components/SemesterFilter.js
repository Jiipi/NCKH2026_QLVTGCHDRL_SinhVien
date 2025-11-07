import React from 'react';
import useSemesterData from '../hooks/useSemesterData';

export default function SemesterFilter({ value, onChange, label = 'Học kỳ', className = '' }) {
  const { options, loading } = useSemesterData();
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
      >
        {(options || []).map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}


