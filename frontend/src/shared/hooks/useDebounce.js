import { useEffect, useState } from 'react';

/**
 * Custom hook để debounce giá trị input
 * @param {*} value - Giá trị cần debounce
 * @param {number} delay - Thời gian delay (ms)
 * @returns {*} - Giá trị đã debounce
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
