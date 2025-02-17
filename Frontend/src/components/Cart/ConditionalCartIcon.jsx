import React from 'react';
import { useLocation } from 'react-router-dom';
import CartIcon from './CartIcon';

const ConditionalCartIcon = () => {
    const location = useLocation();
    const path = location.pathname;

    // Show cart icon only on pharmacy and medicine details pages
    const shouldShowCart = path === '/pharmacy' || path.startsWith('/pharmacy/');

    if (!shouldShowCart) return null;

    return <CartIcon />;
};

export default ConditionalCartIcon; 