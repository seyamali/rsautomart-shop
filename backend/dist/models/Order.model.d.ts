import mongoose, { Document } from 'mongoose';
export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    orderNumber: string;
    items: {
        product: mongoose.Types.ObjectId;
        name: string;
        image: string;
        price: number;
        quantity: number;
        variant?: string;
    }[];
    shippingAddress: {
        name: string;
        phone: string;
        address: string;
        area: string;
        district: string;
        division: string;
    };
    paymentMethod: 'COD' | 'SSLCommerz' | 'bKash';
    paymentStatus: 'pending' | 'paid' | 'failed';
    orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    subtotal: number;
    shippingCost: number;
    discount: number;
    totalAmount: number;
    couponCode?: string;
    trackingId?: string;
    deliveryNote?: string;
    sslTransactionId?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
export default _default;
//# sourceMappingURL=Order.model.d.ts.map