import { useEffect } from 'react';

/**
 * Custom hook to scroll to top of page
 * @function useScrollToTop
 * @param {Array} dependencies - Optional dependencies to trigger scroll
 * @description Provides a reusable way to scroll to top, can be used in any component
 */
const useScrollToTop = (dependencies = []) => {
  useEffect(() => {
    const scrollToTop = () => {
      // Multiple methods for better compatibility
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
      
      // Fallback for document element
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      
      // Fallback for body
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    scrollToTop();
  }, dependencies);

  // Return function to manually trigger scroll
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return scrollToTop;
};

export default useScrollToTop;
