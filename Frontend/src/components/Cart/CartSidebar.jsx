import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { IoMdClose } from 'react-icons/io';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AddressModal from './AddressModal';
import { BASE_URL } from '../../config';

const CartSidebar = ({ isOpen, onClose }) => {
    const { 
        cartItems, 
        totalAmount, 
        clearCart, 
        updateQuantity: updateCartQuantity,  // Rename to avoid confusion
        removeFromCart 
    } = useCart();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [showAddressModal, setShowAddressModal] = useState(false);

    const handleUpdateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        updateCartQuantity(id, quantity);
    };

    const handleRemoveItem = (medicineId) => {
        removeFromCart(medicineId);
    };

    const handleCheckout = () => {
        if (!user) {
            // If user is not logged in, redirect to login
            toast.error('Please login to proceed with checkout');
            navigate('/login');
            onClose();
            return;
        }
        
        // Proceed with checkout for logged-in users
        alert('Proceed to checkout');
    };

    const handlePlaceOrder = async (shippingAddress) => {
        try {
            if (!token) {
                toast.error('Please login to place order');
                navigate('/login');
                return;
            }

            const res = await fetch(`${BASE_URL}/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ shippingAddress })
            });

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            // Use clearCart function instead of dispatch
            clearCart();
            
            toast.success('Order placed successfully!');
            setShowAddressModal(false);
            onClose();
        } catch (error) {
            console.error('Order error:', error);
            toast.error(error.message || 'Failed to place order');
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Shopping Cart</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <IoMdClose size={24} />
                        </button>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-500">Your cart is empty</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div 
                                        key={item._id}
                                        className="flex items-center gap-4 p-4 border-b"
                                    >
                                        <img 
                                            src={item.medicine.photo} 
                                            alt={item.medicine.productName}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.medicine.productName}</h3>
                                            <p className="text-gray-600">${item.medicine.price}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.medicine._id, item.quantity - 1)}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <FiMinus />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.medicine._id, item.quantity + 1)}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <FiPlus />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveItem(item.medicine._id)}
                                                    className="p-1 hover:bg-gray-100 rounded ml-2 text-red-500"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-4">
                                    <span className="font-semibold">Total:</span>
                                    <span className="font-bold">${totalAmount.toFixed(2)}</span>
                                </div>
                                <button 
                                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                                    onClick={() => setShowAddressModal(true)}
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <AddressModal 
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSubmit={handlePlaceOrder}
            />
        </>
    );
};

export default CartSidebar; 