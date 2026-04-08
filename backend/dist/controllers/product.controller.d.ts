import { Request, Response } from 'express';
export declare const getProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProductBySlug: (req: Request, res: Response) => Promise<void>;
export declare const getFeaturedProducts: (_req: Request, res: Response) => Promise<void>;
export declare const getBestSellers: (req: Request, res: Response) => Promise<void>;
export declare const getNewArrivals: (req: Request, res: Response) => Promise<void>;
export declare const createProduct: (req: Request, res: Response) => Promise<void>;
export declare const updateProduct: (req: Request, res: Response) => Promise<void>;
export declare const deleteProduct: (req: Request, res: Response) => Promise<void>;
export declare const updateStock: (req: Request, res: Response) => Promise<void>;
export declare const getAdminProducts: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=product.controller.d.ts.map