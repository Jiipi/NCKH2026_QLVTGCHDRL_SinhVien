export const getStatusColor = (status) => {
  switch (status) {
    case 'cho_duyet': return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' };
    case 'da_duyet': return { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' };
    case 'tu_choi': return { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' };
    case 'da_huy': return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã hủy' };
    case 'ket_thuc': return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Kết thúc' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Không xác định' };
  }
};
