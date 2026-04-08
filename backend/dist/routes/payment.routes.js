"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// Payment
router.post('/sslcommerz/init', auth_middleware_1.verifyToken, payment_controller_1.initPayment);
router.post('/sslcommerz/success', payment_controller_1.paymentSuccess);
router.post('/sslcommerz/fail', payment_controller_1.paymentFail);
// Coupons
router.post('/validate-coupon', auth_middleware_1.optionalAuth, coupon_controller_1.validateCoupon);
router.get('/public-coupons', coupon_controller_1.getPublicCoupons);
router.get('/coupons', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, coupon_controller_1.getCoupons);
router.post('/coupons', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, coupon_controller_1.createCoupon);
router.put('/coupons/:id', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, coupon_controller_1.updateCoupon);
router.delete('/coupons/:id', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, coupon_controller_1.deleteCoupon);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map