import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { BASE_URL } from '../config';
import { toast } from 'react-hot-toast';

export const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CART':
            return {
                ...state,
                cartItems: action.payload.items,
                totalAmount: action.payload.totalAmount,
                totalQuantity: action.payload.items.reduce((total, item) => total + item.quantity, 0)
            };
        case 'CLEAR_CART':
            return {
                ...state,
                cartItems: [],
                totalAmount: 0,
                totalQuantity: 0
            };
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [state, dispatch] = useReducer(cartReducer, {
        cartItems: [],
        totalAmount: 0,
        totalQuantity: 0
    });

    // Fetch cart data when user changes
    useEffect(() => {
        if (user && token) {
            fetchCart();
        } else {
            dispatch({
                type: 'SET_CART',
                payload: { items: [], totalAmount: 0 }
            });
        }
    }, [user, token]);

    const fetchCart = async () => {
        try {
            const res = await fetch(`${BASE_URL}/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            dispatch({
                type: 'SET_CART',
                payload: result.data
            });
        } catch (error) {
            toast.error(error.message);
        }
    };

    const addToCart = async (medicineId, quantity = 1) => {
        try {
            if (!token) {
                toast.error('Please login to add items to cart');
                return;
            }

            const res = await fetch(`${BASE_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ medicineId, quantity })
            });

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            dispatch({
                type: 'SET_CART',
                payload: result.data
            });
            toast.success('Item added to cart');
        } catch (error) {
            console.error('Add to cart error:', error);
            toast.error(error.message || 'Failed to add item to cart');
        }
    };

    const updateQuantity = async (medicineId, quantity) => {
        try {
            const res = await fetch(`${BASE_URL}/cart/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ medicineId, quantity })
            });
            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            dispatch({
                type: 'SET_CART',
                payload: result.data
            });
        } catch (error) {
            toast.error(error.message);
        }
    };

    const removeFromCart = async (medicineId) => {
        try {
            const res = await fetch(`${BASE_URL}/cart/remove/${medicineId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            dispatch({
                type: 'SET_CART',
                payload: result.data
            });
            toast.success('Item removed from cart');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    return (
        <CartContext.Provider 
            value={{
                cartItems: state.cartItems,
                totalAmount: state.totalAmount,
                totalQuantity: state.totalQuantity,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                dispatch
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
}; 