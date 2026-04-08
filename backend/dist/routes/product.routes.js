"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// Public
router.get('/', product_controller_1.getProducts);
router.get('/featured', product_controller_1.getFeaturedProducts);
router.get('/best-sellers', product_controller_1.getBestSellers);
router.get('/new-arrivals', product_controller_1.getNewArrivals);
router.get('/admin', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, product_controller_1.getAdminProducts);
router.get('/:slug', product_controller_1.getProductBySlug);
// Reviews
router.get('/:productId/reviews', review_controller_1.getProductReviews);
router.post('/reviews', auth_middleware_1.verifyToken, review_controller_1.createReview);
router.delete('/reviews/:id', auth_middleware_1.verifyToken, review_controller_1.deleteReview);
// Admin
router.post('/', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, upload_middleware_1.upload.array('images', 6), product_controller_1.createProduct);
router.put('/:id', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, upload_middleware_1.upload.array('images', 6), product_controller_1.updateProduct);
router.delete('/:id', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, product_controller_1.deleteProduct);
router.patch('/:id/stock', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, product_controller_1.updateStock);
exports.default = router;
//# sourceMappingURL=product.routes.js.map