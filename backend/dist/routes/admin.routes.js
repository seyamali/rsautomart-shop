"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_model_1 = __importDefault(require("../models/Order.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyToken, admin_middleware_1.isAdmin);
// Dashboard stats
router.get('/dashboard', async (_req, res) => {
    try {
        const [totalOrders, totalRevenue, totalProducts, totalCustomers] = await Promise.all([
            Order_model_1.default.countDocuments(),
            Order_model_1.default.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Product_model_1.default.countDocuments({ isActive: true }),
            User_model_1.default.countDocuments({ role: 'customer' }),
        ]);
        const recentOrders = await Order_model_1.default.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json({
            stats: {
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalProducts,
                totalCustomers,
            },
            recentOrders,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Sales chart data
router.get('/sales-chart', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const salesData = await Order_model_1.default.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: { $in: ['paid', 'pending'] },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.json({ salesData });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Low stock products
router.get('/low-stock', async (_req, res) => {
    try {
        const products = await Product_model_1.default.find({ 'stock.quantity': { $lt: 5 }, isActive: true })
            .select('name sku stock images')
            .sort({ 'stock.quantity': 1 });
        res.json({ products });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// All customers
router.get('/customers', async (req, res) => {
    try {
        const { page = '1', limit = '20', search } = req.query;
        const filter = { role: 'customer' };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const [customers, total] = await Promise.all([
            User_model_1.default.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            User_model_1.default.countDocuments(filter),
        ]);
        res.json({
            customers,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map