import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Helper to check if an image URL is a real uploaded image (not a default SVG)
 */
const isRealImage = (imageUrl) => {
  if (!imageUrl) return false;
  const url = String(imageUrl);
  const isDefaultSvg = url.includes('/images/activity-') || 
                       url.includes('/images/default-activity') ||
                       (url.endsWith('.svg') && url.includes('/images/'));
  return !isDefaultSvg;
};

/**
 * Get real images from an array, filtering out default SVGs
 */
const getRealImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images.filter(img => isRealImage(img));
};

/**
 * Hook for automatic image slideshow with configurable interval
 * @param {string[]} images - Array of image URLs
 * @param {string} fallbackType - Activity type for fallback image
 * @param {number} interval - Interval in milliseconds (default: 5000ms)
 * @returns {{ currentImage: string, currentIndex: number, totalImages: number, goToNext: Function, goToPrev: Function, goToIndex: Function }}
 */
export function useImageSlideshow(images, fallbackType, interval = 5000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Get real images (excluding default SVGs)
  const realImages = useMemo(() => getRealImages(images), [images]);
  
  // Get fallback image based on activity type
  const fallbackImage = useMemo(() => {
    // Import dynamically to avoid circular dependencies
    const typeMap = {
      'Học thuật': '/images/activity-academic.svg',
      'Văn hóa': '/images/activity-culture.svg',
      'Thể thao': '/images/activity-sports.svg',
      'Tình nguyện': '/images/activity-volunteer.svg',
      'Kỹ năng': '/images/activity-skills.svg',
    };
    return typeMap[fallbackType] || '/images/activity-default.svg';
  }, [fallbackType]);
  
  // Final images array - use real images if available, otherwise fallback
  const displayImages = useMemo(() => {
    return realImages.length > 0 ? realImages : [fallbackImage];
  }, [realImages, fallbackImage]);
  
  const totalImages = displayImages.length;
  const hasMultipleImages = totalImages > 1;
  
  // Auto-advance slideshow
  useEffect(() => {
    if (!hasMultipleImages) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % totalImages);
    }, interval);
    
    return () => clearInterval(timer);
  }, [hasMultipleImages, totalImages, interval]);
  
  // Reset index when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);
  
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % totalImages);
  }, [totalImages]);
  
  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);
  
  const goToIndex = useCallback((index) => {
    setCurrentIndex(index % totalImages);
  }, [totalImages]);
  
  return {
    currentImage: displayImages[currentIndex] || fallbackImage,
    currentIndex,
    totalImages,
    hasMultipleImages,
    goToNext,
    goToPrev,
    goToIndex,
  };
}

export default useImageSlideshow;
