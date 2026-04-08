"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = require("cloudinary");
const Product_model_1 = __importDefault(require("./models/Product.model"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const migrateImages = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        const products = await Product_model_1.default.find({ 'images.url': { $regex: /^\/products\// } });
        console.log(`🔍 Found ${products.length} products with local images`);
        // Base path to the frontend public folder
        const publicPath = path_1.default.join(__dirname, '..', '..', 'frontend', 'public');
        for (const product of products) {
            console.log(`🔼 Uploading images for product: ${product.name}`);
            const newImages = [];
            for (const img of product.images) {
                if (img.url.startsWith('/products/')) {
                    const filePath = path_1.default.join(publicPath, img.url);
                    if (fs_1.default.existsSync(filePath)) {
                        const result = await cloudinary_1.v2.uploader.upload(filePath, {
                            folder: 'rs-automart/products',
                            use_filename: true,
                            unique_filename: false,
                            overwrite: true,
                        });
                        console.log(`   - Uploaded: ${img.url} -> ${result.secure_url}`);
                        newImages.push({ url: result.secure_url, publicId: result.public_id });
                    }
                    else {
                        console.warn(`   - ❌ File not found: ${filePath}`);
                        newImages.push(img); // keep old if not found
                    }
                }
                else {
                    newImages.push(img);
                }
            }
            await Product_model_1.default.findByIdAndUpdate(product._id, { images: newImages });
        }
        console.log('\n🌟 --- Migration Complete ---');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};
migrateImages();
//# sourceMappingURL=migrate-images.js.map