import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * NotificationTemplates Component - Mẫu thông báo nhanh
 */
export default function NotificationTemplates({ templates, onApplyTemplate }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Mẫu thông báo nhanh</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {templates.map(template => (
          <button 
            key={template.id} 
            onClick={() => onApplyTemplate(template)} 
            className="group relative p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition-all text-left"
          >
            <div className="font-bold text-gray-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">
              {template.name}
            </div>
            <div className="text-xs text-gray-600 line-clamp-2">{template.message}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

