import mongoose, { Document } from 'mongoose';
export interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    items: {
        product: mongoose.Types.ObjectId;
        quantity: number;
        variant?: string;
        price: number;
    }[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICart, {}, {}, {}, mongoose.Document<unknown, {}, ICart, {}, mongoose.DefaultSchemaOptions> & ICart & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICart>;
export default _default;
//# sourceMappingURL=Cart.model.d.ts.map