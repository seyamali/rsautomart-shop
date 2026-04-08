import { Router } from 'express';
import { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory, getAdminCategories } from '../controllers/category.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/admin', verifyToken, isAdmin, getAdminCategories);
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', verifyToken, isAdmin, upload.single('image'), createCategory);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateCategory);
router.delete('/:id', verifyToken, isAdmin, deleteCategory);


export default router;
