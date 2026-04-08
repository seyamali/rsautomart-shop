import { Router } from 'express';
import { initPayment, paymentSuccess, paymentFail } from '../controllers/payment.controller';
import { validateCoupon, getPublicCoupons, getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/coupon.controller';
import { verifyToken, optionalAuth } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// Payment
router.post('/sslcommerz/init', verifyToken, initPayment);
router.post('/sslcommerz/success', paymentSuccess);
router.post('/sslcommerz/fail', paymentFail);

// Coupons
router.post('/validate-coupon', optionalAuth, validateCoupon);
router.get('/public-coupons', getPublicCoupons);
router.get('/coupons', verifyToken, isAdmin, getCoupons);
router.post('/coupons', verifyToken, isAdmin, createCoupon);
router.put('/coupons/:id', verifyToken, isAdmin, updateCoupon);
router.delete('/coupons/:id', verifyToken, isAdmin, deleteCoupon);

export default router;
