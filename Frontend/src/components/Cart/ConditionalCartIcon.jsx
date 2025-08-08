import React from 'react';
import { useLocation } from 'react-router-dom';
import CartIcon from './CartIcon';

const ConditionalCartIcon = () => {
    const location = useLocation();
    const path = location.pathname;

    // Hide cart icon on admin and moderator pages
    const isAdminPage = path.startsWith('/admin');
    const isModeratorPage = path.startsWith('/moderator');
    
    // Show cart icon only on pharmacy and medicine details pages, but not on admin/moderator pages
    const shouldShowCart = (path === '/pharmacy' || path.startsWith('/pharmacy/')) && !isAdminPage && !isModeratorPage;

    if (!shouldShowCart) return null;

    return <CartIcon />;
};

export default ConditionalCartIcon; 