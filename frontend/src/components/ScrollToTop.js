// ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Use 'auto' for instant scrolling
    });
  }, [pathname]);
}

// ScrollToTop component if you prefer component-based approach
export function ScrollToTop() {
  useScrollToTop();
  return null;
}