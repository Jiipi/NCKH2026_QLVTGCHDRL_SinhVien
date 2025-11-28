import { CheckCircle, XCircle, AlertCircle, Clock, Award } from 'lucide-react';

export function getStatusColor(statusRaw) {
  const status = statusRaw || 'cho_duyet';
  switch (status) {
    case 'da_duyet': return 'bg-green-100 text-green-800';
    case 'cho_duyet': return 'bg-yellow-100 text-yellow-800';
    case 'tu_choi': return 'bg-red-100 text-red-800';
    case 'da_tham_gia': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusText(statusRaw) {
  const status = statusRaw || 'cho_duyet';
  switch (status) {
    case 'da_duyet': return 'Đã duyệt';
    case 'cho_duyet': return 'Chờ duyệt';
    case 'tu_choi': return 'Từ chối';
    case 'da_tham_gia': return 'Đã tham gia';
    default: return status;
  }
}

export function getStatusIcon(statusRaw) {
  const status = statusRaw || 'cho_duyet';
  switch (status) {
    case 'da_duyet': return <CheckCircle className="w-4 h-4" />;
    case 'cho_duyet': return <Clock className="w-4 h-4" />;
    case 'tu_choi': return <XCircle className="w-4 h-4" />;
    case 'da_tham_gia': return <Award className="w-4 h-4" />;
    default: return <AlertCircle className="w-4 h-4" />;
  }
}

