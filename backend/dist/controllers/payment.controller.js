"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentFail = exports.paymentSuccess = exports.initPayment = void 0;
const Order_model_1 = __importDefault(require("../models/Order.model"));
const sslcommerz_service_1 = require("../services/sslcommerz.service");
const Coupon_model_1 = __importDefault(require("../models/Coupon.model"));
const initPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order_model_1.default.findById(orderId).populate('user', 'name email phone');
        if (!order) {
            res.status(404).json({ message: 'Order not found.' });
            return;
        }
        const user = order.user;
        const result = await (0, sslcommerz_service_1.initSSLCommerz)({
            total_amount: order.totalAmount,
            tran_id: String(order._id),
            cus_name: user.name,
            cus_email: user.email,
            cus_phone: order.shippingAddress.phone,
            cus_add1: order.shippingAddress.address,
            cus_city: order.shippingAddress.district,
            product_name: order.items.map((i) => i.name).join(', '),
            product_category: 'General',
        });
        console.log('[SSLCommerz] Result:', JSON.stringify(result));
        if (result?.GatewayPageURL) {
            res.json({ url: result.GatewayPageURL });
        }
        else {
            res.status(500).json({ message: result?.failedreason || result?.status || 'Payment gateway initialization failed.' });
        }
    }
    catch (error) {
        console.error('[SSLCommerz] Exception:', error.message);
        res.status(500).json({ message: error.message });
    }
};
exports.initPayment = initPayment;
const paymentSuccess = async (req, res) => {
    try {
        const { tran_id, val_id } = req.body;
        const order = await Order_model_1.default.findByIdAndUpdate(tran_id, {
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
            sslTransactionId: val_id,
        }, { new: true });
        // Increment coupon usage
        if (order?.couponCode) {
            await Coupon_model_1.default.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
        }
        res.redirect(`${process.env.FRONTEND_URL}/order-success?orderId=${tran_id}${order?.orderNumber ? `&orderNumber=${encodeURIComponent(order.orderNumber)}` : ''}`);
    }
    catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/order-failed`);
    }
};
exports.paymentSuccess = paymentSuccess;
const paymentFail = async (req, res) => {
    try {
        const { tran_id } = req.body;
        await Order_model_1.default.findByIdAndUpdate(tran_id, { paymentStatus: 'failed' });
        res.redirect(`${process.env.FRONTEND_URL}/order-failed`);
    }
    catch {
        res.redirect(`${process.env.FRONTEND_URL}/order-failed`);
    }
};
exports.paymentFail = paymentFail;
//# sourceMappingURL=payment.controller.js.map