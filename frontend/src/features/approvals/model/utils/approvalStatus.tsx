/**
 * Approval Status Utilities
 * DRY: Centralized status definitions
 */

/**
 * Tab to status mapping
 */
export const TAB_STATUS_MAP = {
  pending: 'cho_duyet',
  approved: 'da_duyet',
  rejected: 'tu_choi',
  completed: 'da_tham_gia'
};

/**
 * Status labels
 */
export const STATUS_LABELS = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  da_tham_gia: 'Đã tham gia'
};

/**
 * Status colors
 */
export const STATUS_COLORS = {
  cho_duyet: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  da_duyet: { bg: 'bg-green-100', text: 'text-green-800' },
  tu_choi: { bg: 'bg-red-100', text: 'text-red-800' },
  da_tham_gia: { bg: 'bg-blue-100', text: 'text-blue-800' }
};

/**
 * Gets status from tab name
 * @param {string} tab - Tab name
 * @returns {string} Status code
 */
export const getStatusFromTab = (tab) => {
  return TAB_STATUS_MAP[tab] || 'cho_duyet';
};

/**
 * Gets status label
 * @param {string} status - Status code
 * @returns {string} Status label
 */
export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || 'Không xác định';
};

/**
 * Gets status color config
 * @param {string} status - Status code
 * @returns {object} Color config with bg and text
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
};
