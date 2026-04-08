"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCouponEligibility = void 0;
const Coupon_model_1 = __importDefault(require("../models/Coupon.model"));
const Order_model_1 = __importDefault(require("../models/Order.model"));
const checkCouponEligibility = async ({ code, orderAmount, userId }) => {
    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon_model_1.default.findOne({ code: normalizedCode, isActive: true });
    if (!coupon) {
        throw new Error('Invalid coupon code.');
    }
    if (coupon.expiresAt < new Date()) {
        throw new Error('Coupon has expired.');
    }
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
        throw new Error('Coupon usage limit reached.');
    }
    if (orderAmount < coupon.minOrderAmount) {
        throw new Error(`Minimum order amount is ৳${coupon.minOrderAmount}.`);
    }
    const perUserMaxUses = coupon.perUserMaxUses ?? 1;
    if (userId && perUserMaxUses > 0) {
        const userUses = await Order_model_1.default.countDocuments({
            user: userId,
            couponCode: coupon.code,
            paymentStatus: { $ne: 'failed' },
            orderStatus: { $nin: ['cancelled', 'returned'] },
        });
        if (userUses >= perUserMaxUses) {
            throw new Error(`You can use this coupon only ${perUserMaxUses} time${perUserMaxUses === 1 ? '' : 's'} per user.`);
        }
    }
    let discount = coupon.discountType === 'percent'
        ? Math.round((orderAmount * coupon.discountValue) / 100)
        : coupon.discountValue;
    if (coupon.discountType === 'percent' && coupon.maxDiscountAmount > 0) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
    }
    return {
        coupon,
        discount,
        perUserMaxUses: coupon.perUserMaxUses ?? 1,
        userUses: userId
            ? await Order_model_1.default.countDocuments({
                user: userId,
                couponCode: coupon.code,
                paymentStatus: { $ne: 'failed' },
                orderStatus: { $nin: ['cancelled', 'returned'] },
            })
            : 0,
    };
};
exports.checkCouponEligibility = checkCouponEligibility;
//# sourceMappingURL=coupon.service.js.map