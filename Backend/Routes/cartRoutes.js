import express from 'express';
import { authenticate } from '../auth/verifyToken.js';
import { 
    getCart, 
    addToCart, 
    updateCartItem, 
    removeFromCart,
    clearCart 
} from '../controllers/cartController.js';

const router = express.Router();

router.use(authenticate); // All cart routes require authentication

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:medicineId', removeFromCart);
router.delete('/clear', clearCart);

export default router; 