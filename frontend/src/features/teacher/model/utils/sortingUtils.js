/**
 * Sorting Utilities (DRY Principle)
 * =================================
 * Reusable sorting functions for teacher data
 * 
 * @module features/teacher/model/utils/sortingUtils
 */

/**
 * Sort items by date (newest first by default)
 * @param {Array} items - Items to sort
 * @param {boolean} ascending - Sort direction
 * @param {string[]} dateFields - Fields to check for date
 * @returns {Array} Sorted array
 */
export function sortByDate(items, ascending = false, dateFields = ['ngay_duyet', 'updated_at', 'updatedAt', 'ngay_dang_ky', 'createdAt']) {
  return [...items].sort((a, b) => {
    const getTime = (item) => {
      for (const field of dateFields) {
        if (item[field]) {
          return new Date(item[field]).getTime();
        }
      }
      return 0;
    };
    
    const ta = getTime(a);
    const tb = getTime(b);
    
    return ascending ? ta - tb : tb - ta;
  });
}

/**
 * Sort items by name (Vietnamese locale aware)
 * @param {Array} items - Items to sort
 * @param {Function} getName - Function to extract name from item
 * @param {boolean} ascending - Sort direction
 * @returns {Array} Sorted array
 */
export function sortByName(items, getName, ascending = true) {
  return [...items].sort((a, b) => {
    const nameA = (getName(a) || '').toLowerCase();
    const nameB = (getName(b) || '').toLowerCase();
    const result = nameA.localeCompare(nameB, 'vi');
    return ascending ? result : -result;
  });
}

/**
 * Sort items by numeric value
 * @param {Array} items - Items to sort
 * @param {Function} getValue - Function to extract value from item
 * @param {boolean} ascending - Sort direction
 * @returns {Array} Sorted array
 */
export function sortByNumber(items, getValue, ascending = true) {
  return [...items].sort((a, b) => {
    const va = getValue(a) || 0;
    const vb = getValue(b) || 0;
    return ascending ? va - vb : vb - va;
  });
}

/**
 * Generic sorter with multiple sort types
 * @param {Array} items - Items to sort
 * @param {string} sortBy - Sort type
 * @param {Object} config - Configuration for field extraction
 * @returns {Array} Sorted array
 */
export function sortItems(items, sortBy, config = {}) {
  const {
    nameGetter = (item) => item.name || item.ho_ten || '',
    pointsGetter = (item) => item.diem_rl || item.points || 0,
    dateFields = ['ngay_duyet', 'updated_at', 'updatedAt', 'ngay_dang_ky', 'createdAt', 'tg_diem_danh']
  } = config;

  switch (sortBy) {
    case 'oldest':
      return sortByDate(items, true, dateFields);
    case 'newest':
      return sortByDate(items, false, dateFields);
    case 'name-az':
      return sortByName(items, nameGetter, true);
    case 'name-za':
      return sortByName(items, nameGetter, false);
    case 'points-high':
      return sortByNumber(items, pointsGetter, false);
    case 'points-low':
      return sortByNumber(items, pointsGetter, true);
    default:
      return sortByDate(items, false, dateFields);
  }
}
