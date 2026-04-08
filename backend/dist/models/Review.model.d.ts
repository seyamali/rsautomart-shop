import mongoose, { Document } from 'mongoose';
export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    isVerifiedPurchase: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview, {}, mongoose.DefaultSchemaOptions> & IReview & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IReview>;
export default _default;
//# sourceMappingURL=Review.model.d.ts.map