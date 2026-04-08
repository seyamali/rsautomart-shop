"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.getOrderById = exports.getMyOrders = exports.createOrder = void 0;
const Order_model_1 = __importDefault(require("../models/Order.model"));
const Cart_model_1 = __importDefault(require("../models/Cart.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const Coupon_model_1 = __importDefault(require("../models/Coupon.model"));
const email_service_1 = require("../services/email.service");
const coupon_service_1 = require("../services/coupon.service");
const DHAKA_DISTRICTS = ['dhaka', 'gazipur', 'narayanganj', 'manikganj', 'munshiganj', 'narsingdi'];
const FREE_SHIPPING_MIN = 999;
const isInsideDhaka = (shippingAddress) => {
    const district = shippingAddress.district?.trim().toLowerCase();
    const division = shippingAddress.division?.trim().toLowerCase();
    return division === 'dhaka' || (district ? DHAKA_DISTRICTS.includes(district) : false);
};
const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, couponCode, deliveryNote, items: directItems } = req.body;
        // Get items from cart or direct
        let orderItems = [];
        if (directItems && directItems.length > 0) {
            orderItems = directItems;
        }
        else {
            const cart = await Cart_model_1.default.findOne({ user: req.user._id }).populate('items.product');
            if (!cart || cart.items.length === 0) {
                res.status(400).json({ message: 'Cart is empty.' });
                return;
            }
            orderItems = cart.items.map((item) => ({
                product: item.product._id,
                name: item.product.name,
                image: item.product.images?.[0]?.url || '',
                price: item.price,
                quantity: item.quantity,
                variant: item.variant,
            }));
        }
        const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        // Calculate shipping
        let shippingCost = isInsideDhaka(shippingAddress) ? 60 : 120;
        if (subtotal >= FREE_SHIPPING_MIN)
            shippingCost = 0;
        let discount = 0;
        const normalizedCouponCode = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : '';
        if (normalizedCouponCode) {
            const result = await (0, coupon_service_1.checkCouponEligibility)({
                code: normalizedCouponCode,
                orderAmount: subtotal,
                userId: req.user._id.toString(),
            });
            discount = result.discount;
        }
        const totalAmount = subtotal + shippingCost - discount;
        const order = await Order_model_1.default.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
            subtotal,
            shippingCost,
            discount,
            totalAmount,
            couponCode,
            deliveryNote,
        });
        // Reduce stock
        for (const item of orderItems) {
            await Product_model_1.default.findByIdAndUpdate(item.product, {
                $inc: { 'stock.quantity': -item.quantity, totalSold: item.quantity },
            });
        }
        // Clear cart
        await Cart_model_1.default.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0 });
        if (normalizedCouponCode && paymentMethod === 'COD') {
            await Coupon_model_1.default.findOneAndUpdate({ code: normalizedCouponCode }, { $inc: { usedCount: 1 } });
        }
        // Send emails (fire and forget)
        try {
            await (0, email_service_1.sendOrderConfirmation)(req.user.email, order.orderNumber, totalAmount, orderItems);
            await (0, email_service_1.sendNewOrderNotification)(order.orderNumber, totalAmount, req.user.name);
        }
        catch { }
        res.status(201).json({ order });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createOrder = createOrder;
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order_model_1.default.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ orders });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyOrders = getMyOrders;
const getOrderById = async (req, res) => {
    try {
        const order = await Order_model_1.default.findById(req.params.id).populate('user', 'name email phone');
        if (!order) {
            res.status(404).json({ message: 'Order not found.' });
            return;
        }
        // Customers can only see their own orders
        if (req.user.role !== 'admin' && order.user._id?.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Access denied.' });
            return;
        }
        res.json({ order });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getOrderById = getOrderById;
// Admin
const getAllOrders = async (req, res) => {
    try {
        const { status, page = '1', limit = '20' } = req.query;
        const filter = {};
        if (status)
            filter.orderStatus = status;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [orders, total] = await Promise.all([
            Order_model_1.default.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Order_model_1.default.countDocuments(filter),
        ]);
        res.json({
            orders,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus, trackingId } = req.body;
        const update = {};
        if (orderStatus)
            update.orderStatus = orderStatus;
        if (paymentStatus)
            update.paymentStatus = paymentStatus;
        if (trackingId)
            update.trackingId = trackingId;
        const order = await Order_model_1.default.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!order) {
            res.status(404).json({ message: 'Order not found.' });
            return;
        }
        res.json({ order });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=order.controller.js.map