"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100 },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
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
}, { timestamps: true });
// Auto-calculate discount percent
productSchema.pre('save', function () {
    if (this.discountPrice && this.price > 0) {
        this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    // Auto-update stock status
    if (this.stock.quantity === 0) {
        this.stock.status = 'out_of_stock';
    }
    else if (this.stock.quantity <= 5) {
        this.stock.status = 'low_stock';
    }
    else {
        this.stock.status = 'in_stock';
    }
});
productSchema.index({ name: 'text', tags: 'text', sku: 'text', description: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
exports.default = mongoose_1.default.model('Product', productSchema);
//# sourceMappingURL=Product.model.js.map