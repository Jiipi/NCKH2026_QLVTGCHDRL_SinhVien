import { CheckCircle, XCircle, AlertCircle, Clock, Award } from 'lucide-react';

export function getStatusColor(statusRaw) {
  const status = statusRaw || 'cho_duyet';
  switch (status) {
    case 'da_duyet': return 'border border-emerald-200/70 bg-emerald-50/70 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300';
    case 'cho_duyet': return 'border border-amber-200/70 bg-amber-50/70 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300';
    case 'tu_choi': return 'border border-rose-200/70 bg-rose-50/70 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300';
    case 'da_tham_gia': return 'border border-indigo-200/70 bg-indigo-50/70 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300';
    default: return 'border border-white/60 bg-white/55 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300';
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
    case 'da_duyet': return <CheckCircle className="h-4 w-4" />;
    case 'cho_duyet': return <Clock className="h-4 w-4" />;
    case 'tu_choi': return <XCircle className="h-4 w-4" />;
    case 'da_tham_gia': return <Award className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
}

