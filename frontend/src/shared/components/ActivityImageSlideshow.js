import React, { useState, useEffect, useMemo } from 'react';
import { getActivityImage, getActivityImages } from '../lib/activityImages';

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
 * Activity Image Slideshow Component
 * Automatically cycles through images every 5 seconds with fade transition
 * 
 * @param {Object} props
 * @param {string|string[]} props.images - Image URL or array of image URLs
 * @param {string} props.activityType - Activity type for fallback image
 * @param {string} props.alt - Alt text for images
 * @param {string} props.className - Additional CSS classes for the image
 * @param {number} props.interval - Interval in milliseconds (default: 5000)
 * @param {Function} props.onError - Error handler for image loading
 * @param {boolean} props.showDots - Show dot indicators (default: false)
 * @param {string} props.dotsPosition - Position of dots: 'bottom' | 'top' (default: 'bottom')
 */
export default function ActivityImageSlideshow({ 
  images, 
  activityType, 
  alt = 'Hoạt động',
  className = '',
  interval = 5000,
  onError,
  showDots = false,
  dotsPosition = 'bottom'
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Get all images with fallback
  const allImages = useMemo(() => {
    const imgArray = getActivityImages(images, activityType);
    const realImgs = getRealImages(imgArray);
    // If we have real images, use them; otherwise use the fallback
    return realImgs.length > 0 ? realImgs : [getActivityImage(null, activityType)];
  }, [images, activityType]);
  
  const totalImages = allImages.length;
  const hasMultipleImages = totalImages > 1;
  
  // Auto-advance slideshow with fade effect
  useEffect(() => {
    if (!hasMultipleImages) return;
    
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % totalImages);
        setIsTransitioning(false);
      }, 300); // Match transition duration
    }, interval);
    
    return () => clearInterval(timer);
  }, [hasMultipleImages, totalImages, interval]);
  
  // Reset index when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);
  
  const handleImageError = (e) => {
    if (onError) {
      onError(e);
    } else {
      // Fallback to default image on error
      e.target.src = getActivityImage(null, activityType);
    }
  };

  // Handle dot click to jump to specific image
  const handleDotClick = (index) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 150);
  };
  
  // If showDots is enabled, wrap in a container
  if (showDots && hasMultipleImages) {
    return (
      <div className="relative w-full h-full">
        <img
          src={allImages[currentIndex]}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
          onError={handleImageError}
          loading="eager"
          decoding="sync"
          style={{ imageRendering: 'high-quality' }}
        />
        {/* Dots indicator */}
        <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 ${
          dotsPosition === 'top' ? 'top-3' : 'bottom-3'
        }`}>
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white w-4 shadow-lg' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Xem ảnh ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <img
      src={allImages[currentIndex]}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
      onError={handleImageError}
      loading="eager"
      decoding="sync"
      style={{ imageRendering: 'high-quality' }}
    />
  );
}
