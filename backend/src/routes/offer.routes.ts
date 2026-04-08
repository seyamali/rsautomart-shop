import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { createOffer, deleteOffer, getAdminOffers, getOffers, updateOffer } from '../controllers/offer.controller';

const router = Router();

router.get('/', getOffers);
router.get('/admin', verifyToken, isAdmin, getAdminOffers);
router.post('/', verifyToken, isAdmin, createOffer);
router.put('/:id', verifyToken, isAdmin, updateOffer);
router.delete('/:id', verifyToken, isAdmin, deleteOffer);

export default router;
