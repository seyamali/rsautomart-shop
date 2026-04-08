"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getCoupons = exports.getPublicCoupons = exports.validateCoupon = void 0;
const Coupon_model_1 = __importDefault(require("../models/Coupon.model"));
const coupon_service_1 = require("../services/coupon.service");
const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        const result = await (0, coupon_service_1.checkCouponEligibility)({
            code,
            orderAmount: Number(orderAmount),
            userId: req.user?._id?.toString(),
        });
        res.json({
            coupon: result.coupon,
            discount: result.discount,
            perUserMaxUses: result.perUserMaxUses,
            userUses: result.userUses,
        });
    }
    catch (error) {
        const message = error.message || 'Failed to validate coupon.';
        res.status(message.includes('Invalid coupon') ? 404 : 400).json({ message });
    }
};
exports.validateCoupon = validateCoupon;
const getPublicCoupons = async (_req, res) => {
    try {
        const coupons = await Coupon_model_1.default.find({
            isActive: true,
            expiresAt: { $gte: new Date() },
        })
            .select('code discountType discountValue minOrderAmount expiresAt maxDiscountAmount')
            .sort({ createdAt: -1 });
        res.json({ coupons });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getPublicCoupons = getPublicCoupons;
const getCoupons = async (_req, res) => {
    try {
        const coupons = await Coupon_model_1.default.find().sort({ createdAt: -1 });
        res.json({ coupons });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCoupons = getCoupons;
const createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon_model_1.default.create(req.body);
        res.status(201).json({ coupon });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createCoupon = createCoupon;
const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) {
            res.status(404).json({ message: 'Coupon not found.' });
            return;
        }
        res.json({ coupon });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateCoupon = updateCoupon;
const deleteCoupon = async (req, res) => {
    try {
        await Coupon_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteCoupon = deleteCoupon;
//# sourceMappingURL=coupon.controller.js.map