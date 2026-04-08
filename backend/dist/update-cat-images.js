"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Product_model_1 = __importDefault(require("./models/Product.model"));
const Category_model_1 = __importDefault(require("./models/Category.model"));
dotenv_1.default.config();
const updateCategoryImages = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        // Mapping of category slugs to a key product image
        const mapping = {
            'car-accessories': 'RSA-012', // Bangladesh Flag Stand
            'car-care': 'RSA-007', // DTR Glass Cleaner
            'electronics': 'RSA-001', // Quick Charge Car Charger
            'interior': 'RSA-003', // Car Console Organizer
            'collectibles': 'RSA-002', // Diecast Jeep Wrangler
            'cooling-comfort': 'RSA-008', // Car Seat Cooling Fan
        };
        for (const [slug, sku] of Object.entries(mapping)) {
            const product = await Product_model_1.default.findOne({ sku });
            const category = await Category_model_1.default.findOne({ slug });
            if (product && category && product.images.length > 0) {
                console.log(`🖼️ Assigning image for ${category.name}: ${product.images[0].url}`);
                await Category_model_1.default.findByIdAndUpdate(category._id, {
                    image: {
                        url: product.images[0].url,
                        publicId: product.images[0].publicId
                    }
                });
            }
            else {
                console.warn(`⚠️ Could not find product with SKU ${sku} or category ${slug}`);
            }
        }
        console.log('\n🌟 --- Category Images Updated ---');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Update failed:', error);
        process.exit(1);
    }
};
updateCategoryImages();
//# sourceMappingURL=update-cat-images.js.map