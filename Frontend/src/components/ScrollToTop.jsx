import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component - Scrolls to top of page on route change
 * @component
 * @description Automatically scrolls the window to the top when the route changes
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Function to scroll to top with multiple fallbacks
    const scrollToTop = () => {
      // Method 1: Standard window scroll
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto' // Use 'auto' for immediate scroll
      });
      
      // Method 2: Document element scroll (for compatibility)
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }
      
      // Method 3: Body scroll (for older browsers)
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }
      
      // Method 4: Force scroll using requestAnimationFrame
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    };

    // Scroll immediately
    scrollToTop();
    
    // Also scroll after a small delay to handle any async rendering
    setTimeout(scrollToTop, 100);
  }, [pathname, search]); // Include search params to handle query changes

  return null;
};

export default ScrollToTop;
