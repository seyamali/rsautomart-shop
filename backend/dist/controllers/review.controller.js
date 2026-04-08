"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.createReview = exports.getProductReviews = void 0;
const Review_model_1 = __importDefault(require("../models/Review.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const Order_model_1 = __importDefault(require("../models/Order.model"));
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review_model_1.default.find({ product: req.params.productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json({ reviews });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProductReviews = getProductReviews;
const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        // Check if user has purchased and received this product
        const order = await Order_model_1.default.findOne({
            user: req.user._id,
            'items.product': productId,
            orderStatus: 'delivered',
        });
        const isVerifiedPurchase = !!order;
        const review = await Review_model_1.default.create({
            user: req.user._id,
            product: productId,
            rating,
            comment,
            isVerifiedPurchase,
        });
        // Update product ratings
        const reviews = await Review_model_1.default.find({ product: productId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Product_model_1.default.findByIdAndUpdate(productId, {
            ratings: { average: Math.round(avgRating * 10) / 10, count: reviews.length },
        });
        await review.populate('user', 'name');
        res.status(201).json({ review });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'You have already reviewed this product.' });
            return;
        }
        res.status(500).json({ message: error.message });
    }
};
exports.createReview = createReview;
const deleteReview = async (req, res) => {
    try {
        const review = await Review_model_1.default.findById(req.params.id);
        if (!review) {
            res.status(404).json({ message: 'Review not found.' });
            return;
        }
        // Only admin or review owner can delete
        if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Access denied.' });
            return;
        }
        const productId = review.product;
        await Review_model_1.default.findByIdAndDelete(req.params.id);
        // Recalculate ratings
        const reviews = await Review_model_1.default.find({ product: productId });
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        await Product_model_1.default.findByIdAndUpdate(productId, {
            ratings: { average: Math.round(avgRating * 10) / 10, count: reviews.length },
        });
        res.json({ message: 'Review deleted.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteReview = deleteReview;
//# sourceMappingURL=review.controller.js.map