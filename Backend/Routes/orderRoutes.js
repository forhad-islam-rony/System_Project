import express from 'express';
import { authenticate, restrict } from '../auth/verifyToken.js';
import { 
    createOrder, 
    getUserOrders, 
    getAllOrders,
    updateOrderStatus,
    getOrderDetails
} from '../controllers/orderController.js';

const router = express.Router();

// Public routes
router.use(authenticate);
router.post('/create', createOrder);
router.get('/user-orders', getUserOrders);

// Admin routes
router.get('/all', authenticate, restrict(['admin']), getAllOrders);
router.get('/:id', authenticate, restrict(['admin']), getOrderDetails);
router.patch('/:id/status', authenticate, restrict(['admin']), updateOrderStatus);

export default router; 