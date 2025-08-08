import React, { useState } from 'react';
import { BsCart3 } from 'react-icons/bs';
import { useCart } from '../../context/CartContext';
import CartSidebar from './CartSidebar';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const CartIcon = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { totalQuantity } = useCart();
    const { user } = useAuth();

    const handleCartClick = () => {
        if (!user) {
            toast.error('Please login to view your cart');
            return;
        }
        setIsOpen(true);
    };

    return (
        <>
            <button 
                onClick={handleCartClick}
                className="fixed bottom-32 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300 z-50"
            >
                <div className="relative">
                    <BsCart3 size={24} />
                    {totalQuantity > 0 && user && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {totalQuantity}
                        </span>
                    )}
                </div>
            </button>
            <CartSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default CartIcon; 