import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

export const createOrder = async (req, res) => {
    try {
        const userId = req.userId;  // This comes from the authenticate middleware
        const { shippingAddress } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Get user's cart
        const cart = await Cart.findOne({ user: userId }).populate('items.medicine');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Create order items from cart items
        const orderItems = cart.items.map(item => ({
            medicine: item.medicine._id,
            quantity: item.quantity,
            price: item.medicine.price
        }));

        // Create new order
        const order = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount: cart.totalAmount,
            shippingAddress,
            paymentMethod: 'cod'
        });

        // Clear the cart after order is created
        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [], totalAmount: 0 } }
        );

        // Populate order details
        await order.populate('items.medicine');
        await order.populate('user', 'name email');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({ user: userId })
            .populate('items.medicine')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.medicine')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.medicine');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order details fetched successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order details',
            error: error.message
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email')
         .populate('items.medicine');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
}; 