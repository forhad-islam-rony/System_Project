import Cart from '../models/Cart.js';

// Get user's cart
export const getCart = async (req, res) => {
    try {
        const userId = req.userId;
        let cart = await Cart.findOne({ user: userId })
            .populate('items.medicine');

        if (!cart) {
            cart = await Cart.create({ 
                user: userId,
                items: [],
                totalAmount: 0
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cart fetched successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cart',
            error: error.message
        });
    }
};

// Add item to cart
export const addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { medicineId, quantity } = req.body;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [],
                totalAmount: 0
            });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.medicine.toString() === medicineId
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item if it doesn't exist
            cart.items.push({
                medicine: medicineId,
                quantity: quantity
            });
        }

        // Recalculate total amount
        await cart.populate('items.medicine');
        cart.totalAmount = cart.items.reduce((total, item) => {
            return total + (item.medicine.price * item.quantity);
        }, 0);

        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { medicineId, quantity } = req.body;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.medicine.toString() === medicineId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        if (quantity < 1) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        // Recalculate total amount
        await cart.populate('items.medicine');
        cart.totalAmount = cart.items.reduce((total, item) => {
            return total + (item.medicine.price * item.quantity);
        }, 0);

        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update cart',
            error: error.message
        });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { medicineId } = req.params;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(
            item => item.medicine.toString() !== medicineId
        );

        // Recalculate total amount
        await cart.populate('items.medicine');
        cart.totalAmount = cart.items.reduce((total, item) => {
            return total + (item.medicine.price * item.quantity);
        }, 0);

        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
};

// Clear cart
export const clearCart = async (req, res) => {
    try {
        const userId = req.userId;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
}; 