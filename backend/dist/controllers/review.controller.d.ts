import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getProductReviews: (req: Request, res: Response) => Promise<void>;
export declare const createReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteReview: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=review.controller.d.ts.map