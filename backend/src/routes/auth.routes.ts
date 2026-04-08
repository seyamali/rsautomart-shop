import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword, logout } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { validateRegistration, validateLogin, validateChangePassword } from '../middleware/validate.middleware';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, validateChangePassword, changePassword);

export default router;

