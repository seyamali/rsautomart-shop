import mongoose, { Document } from 'mongoose';
export interface IOffer extends Document {
    title: string;
    description: string;
    banner?: {
        url: string;
        publicId: string;
    };
    discountPercent: number;
    products: mongoose.Types.ObjectId[];
    categories: mongoose.Types.ObjectId[];
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOffer, {}, {}, {}, mongoose.Document<unknown, {}, IOffer, {}, mongoose.DefaultSchemaOptions> & IOffer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOffer>;
export default _default;
//# sourceMappingURL=Offer.model.d.ts.map