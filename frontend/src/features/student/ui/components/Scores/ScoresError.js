import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ScoresError({ message }) {
  if (!message) return null;
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2">
      <AlertCircle className="h-5 w-5 text-yellow-600" />
      <span className="text-yellow-800">{message}</span>
    </div>
  );
}

