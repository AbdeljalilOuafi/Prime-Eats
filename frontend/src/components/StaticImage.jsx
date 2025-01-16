import { useMemo } from 'react';
import PropTypes from 'prop-types';
import img1 from '../assets/placeholders/restaurant-1.jpg';
import img2 from '../assets/placeholders/restaurant-2.jpg';
import img3 from '../assets/placeholders/restaurant-3.jpg';
import img4 from '../assets/placeholders/restaurant-4.jpeg';
import img5 from '../assets/placeholders/restaurant-5.avif';
import img6 from '../assets/placeholders/restaurant-6.jpg';
import img7 from '../assets/placeholders/restaurant-7.jpg';
import img8 from '../assets/placeholders/restaurant-8.jpg';

const PLACEHOLDER_IMAGES = [
    img1, img2, img3, img4, img5, img6, img7, img8
];

const StaticImage = ({ 
  src, 
  alt, 
  className = '', 
  restaurantId = null,
  fallbackIndex = null 
}) => {
  // Use restaurantId to maintain consistent image for same restaurant
  const placeholderIndex = useMemo(() => {
    if (fallbackIndex !== null) return fallbackIndex;
    
    if (restaurantId) {
      // Convert restaurantId to string and handle non-string values
      const idString = String(restaurantId);
      
      // Create consistent index based on restaurantId
      const hash = idString.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      return hash % PLACEHOLDER_IMAGES.length;
    }
    
    // Random index if no restaurantId provided
    return Math.floor(Math.random() * PLACEHOLDER_IMAGES.length);
  }, [restaurantId, fallbackIndex]);

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGES[placeholderIndex];
    e.target.alt = "Restaurant placeholder image";
  };

  return (
    <img
      src={src || PLACEHOLDER_IMAGES[placeholderIndex]}
      alt={alt}
      className={`${className} transition-opacity duration-300`}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

StaticImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  restaurantId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  fallbackIndex: PropTypes.number
};

export default StaticImage;