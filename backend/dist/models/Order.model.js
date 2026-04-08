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
const orderSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [
        {
            product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
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
}, { timestamps: true });
// Auto-generate order number
orderSchema.pre('validate', async function () {
    if (this.isNew && !this.orderNumber) {
        const count = await mongoose_1.default.model('Order').countDocuments();
        this.orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;
    }
});
exports.default = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=Order.model.js.map