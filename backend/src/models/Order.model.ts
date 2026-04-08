import mongoose, { Schema, Document } from 'mongoose';

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

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        variant: { type: String },
      },
    ],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      area: { type: String, required: true },
      district: { type: String, required: true },
      division: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'SSLCommerz', 'bKash'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    couponCode: { type: String },
    trackingId: { type: String },
    deliveryNote: { type: String },
    sslTransactionId: { type: String },
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('validate', async function () {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;
  }
});

export default mongoose.model<IOrder>('Order', orderSchema);
