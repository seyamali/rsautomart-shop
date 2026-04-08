"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.verifyToken, order_controller_1.createOrder);
router.get('/my-orders', auth_middleware_1.verifyToken, order_controller_1.getMyOrders);
router.get('/:id', auth_middleware_1.verifyToken, order_controller_1.getOrderById);
// Admin
router.get('/', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, order_controller_1.getAllOrders);
router.put('/:id/status', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, order_controller_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=order.routes.js.map