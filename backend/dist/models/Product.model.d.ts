import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    name: string;
    slug: string;
    sku: string;
    description: string;
    shortDescription?: string;
    price: number;
    discountPrice?: number;
    discountPercent?: number;
    category: mongoose.Types.ObjectId;
    subCategory?: string;
    brand?: string;
    images: {
        url: string;
        publicId: string;
    }[];
    stock: {
        quantity: number;
        status: 'in_stock' | 'low_stock' | 'out_of_stock';
    };
    variants: {
        type: string;
        value: string;
        price?: number;
        stock?: number;
    }[];
    tags: string[];
    specifications: {
        key: string;
        value: string;
    }[];
    isFeatured: boolean;
    isBestSeller: boolean;
    isNewArrival: boolean;
    isActive: boolean;
    warranty?: string;
    ratings: {
        average: number;
        count: number;
    };
    totalSold: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, mongoose.DefaultSchemaOptions> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProduct>;
export default _default;
//# sourceMappingURL=Product.model.d.ts.map