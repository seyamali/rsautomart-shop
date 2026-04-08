import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getAdminProducts,
} from '../controllers/product.controller';

import { getProductReviews, createReview, deleteReview } from '../controllers/review.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Public
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/best-sellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/admin', verifyToken, isAdmin, getAdminProducts);
router.get('/:slug', getProductBySlug);


// Reviews
router.get('/:productId/reviews', getProductReviews);
router.post('/reviews', verifyToken, createReview);
router.delete('/reviews/:id', verifyToken, deleteReview);

// Admin
router.post('/', verifyToken, isAdmin, upload.array('images', 6), createProduct);


router.put('/:id', verifyToken, isAdmin, upload.array('images', 6), updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);
router.patch('/:id/stock', verifyToken, isAdmin, updateStock);

export default router;
