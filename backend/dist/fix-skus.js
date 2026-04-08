"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Product_model_1 = __importDefault(require("./models/Product.model"));
dotenv_1.default.config();
const fixSkus = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        const products = await Product_model_1.default.find({ sku: { $regex: /^RSA-\d{3}$/ } });
        console.log(`🔍 Found ${products.length} products with 3-digit SKUs`);
        for (const product of products) {
            const oldSku = product.sku;
            const number = oldSku.split('-')[1];
            const newSku = `RSA-${number.padStart(4, '0')}`;
            console.log(`🔄 Updating: ${oldSku} ➔ ${newSku}`);
            await Product_model_1.default.findByIdAndUpdate(product._id, { sku: newSku });
        }
        console.log('\n🌟 --- SKU Migration Complete ---');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};
fixSkus();
//# sourceMappingURL=fix-skus.js.map