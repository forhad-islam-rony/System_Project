import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CrispChatController = () => {
  const location = useLocation();

  useEffect(() => {
    const toggleCrispChat = () => {
      const path = location.pathname;
      const isAdminPage = path.startsWith('/admin');
      const isModeratorPage = path.startsWith('/moderator');
      
      // Wait for Crisp to be loaded
      const checkCrisp = () => {
        if (window.$crisp && window.$crisp.push) {
          if (isAdminPage || isModeratorPage) {
            window.$crisp.push(["do", "chat:hide"]);
          } else {
            window.$crisp.push(["do", "chat:show"]);
          }
        } else {
          // Retry after a short delay if Crisp isn't loaded yet
          setTimeout(checkCrisp, 500);
        }
      };
      
      checkCrisp();
    };

    // Small delay to ensure Crisp is loaded
    const timer = setTimeout(toggleCrispChat, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default CrispChatController;
