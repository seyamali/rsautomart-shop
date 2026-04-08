import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart } from '../controllers/cart.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', verifyToken, getCart);
router.post('/sync', verifyToken, syncCart);
router.post('/add', verifyToken, addToCart);
router.put('/update', verifyToken, updateCartItem);
router.delete('/remove/:productId', verifyToken, removeFromCart);
router.delete('/clear', verifyToken, clearCart);

export default router;
