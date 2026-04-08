import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createOrder: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyOrders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getOrderById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllOrders: (req: Request, res: Response) => Promise<void>;
export declare const updateOrderStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=order.controller.d.ts.map