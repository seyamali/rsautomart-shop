import mongoose, { Schema, Document } from 'mongoose';

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
  images: { url: string; publicId: string }[];
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
  specifications: { key: string; value: string }[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  warranty?: string;
  ratings: { average: number; count: number };
  totalSold: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: String },
    brand: { type: String },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    stock: {
      quantity: { type: Number, required: true, default: 0, min: 0 },
      status: {
        type: String,
        enum: ['in_stock', 'low_stock', 'out_of_stock'],
        default: 'in_stock',
      },
    },
    variants: [
      {
        type: { type: String },
        value: { type: String },
        price: { type: Number },
        stock: { type: Number },
      },
    ],
    tags: [{ type: String }],
    specifications: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    warranty: { type: String },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    totalSold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-calculate discount percent
productSchema.pre('save', function () {
  if (this.discountPrice && this.price > 0) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  // Auto-update stock status
  if (this.stock.quantity === 0) {
    this.stock.status = 'out_of_stock';
  } else if (this.stock.quantity <= 5) {
    this.stock.status = 'low_stock';
  } else {
    this.stock.status = 'in_stock';
  }
});

productSchema.index({ name: 'text', tags: 'text', sku: 'text', description: 'text' });

productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
