import { Request, Response } from 'express';
import Coupon from '../models/Coupon.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { checkCouponEligibility } from '../services/coupon.service';

export const validateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, orderAmount } = req.body;
    const result = await checkCouponEligibility({
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
  } catch (error: any) {
    const message = error.message || 'Failed to validate coupon.';
    res.status(message.includes('Invalid coupon') ? 404 : 400).json({ message });
  }
};

export const getPublicCoupons = async (_req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gte: new Date() },
    })
      .select('code discountType discountValue minOrderAmount expiresAt maxDiscountAmount maxUses usedCount perUserMaxUses description')
      .sort({ createdAt: -1 });

    res.json({ coupons });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCoupons = async (_req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ coupon });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found.' });
      return;
    }
    res.json({ coupon });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
