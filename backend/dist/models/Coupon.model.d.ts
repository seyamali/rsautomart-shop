import mongoose, { Document } from 'mongoose';
export interface ICoupon extends Document {
    code: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount: number;
    maxUses: number;
    usedCount: number;
    perUserMaxUses: number;
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICoupon, {}, {}, {}, mongoose.Document<unknown, {}, ICoupon, {}, mongoose.DefaultSchemaOptions> & ICoupon & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICoupon>;
export default _default;
//# sourceMappingURL=Coupon.model.d.ts.map