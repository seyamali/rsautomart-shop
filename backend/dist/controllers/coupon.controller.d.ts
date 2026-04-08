import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const validateCoupon: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPublicCoupons: (_req: Request, res: Response) => Promise<void>;
export declare const getCoupons: (_req: Request, res: Response) => Promise<void>;
export declare const createCoupon: (req: Request, res: Response) => Promise<void>;
export declare const updateCoupon: (req: Request, res: Response) => Promise<void>;
export declare const deleteCoupon: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=coupon.controller.d.ts.map