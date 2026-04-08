"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_model_1 = __importDefault(require("./models/User.model"));
const Category_model_1 = __importDefault(require("./models/Category.model"));
const Product_model_1 = __importDefault(require("./models/Product.model"));
dotenv_1.default.config();
const seedData = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        // Clear existing data
        await Promise.all([
            User_model_1.default.deleteMany({}),
            Category_model_1.default.deleteMany({}),
            Product_model_1.default.deleteMany({})
        ]);
        console.log('🧹 Database cleared');
        // Create admin user
        const admin = await User_model_1.default.create({
            name: 'Admin',
            email: 'admin@rsautomart.com',
            phone: '+8801700000000',
            password: 'admin123',
            role: 'admin',
        });
        console.log('👤 Admin user created');
        // Create categories with images from dummy data
        const categoriesData = [
            { name: 'Car Accessories', slug: 'car-accessories', isActive: true },
            { name: 'Car Care', slug: 'car-care', isActive: true },
            { name: 'Electronics', slug: 'electronics', isActive: true },
            { name: 'Interior', slug: 'interior', isActive: true },
            { name: 'Collectibles', slug: 'collectibles', isActive: true },
            { name: 'Cooling & Comfort', slug: 'cooling-comfort', isActive: true },
        ];
        const categories = await Category_model_1.default.insertMany(categoriesData);
        console.log('📂 Categories created:', categories.length);
        // Map categories for easy lookup
        const catMap = {};
        categories.forEach(cat => {
            catMap[cat.slug] = cat._id;
        });
        // Comprehensive product data from dummyData.ts
        const productsData = [
            {
                name: 'Quick Charge 3.0 Car Charger – 3-in-1 Cable',
                slug: 'quick-charge-car-charger-3in1',
                sku: 'RSA-001',
                description: 'Fast charging car charger with QC 3.0 support. Comes with 3-in-1 braided cable (Lightning, USB-C, Micro USB). Universal compatibility.',
                shortDescription: 'QC 3.0 car charger with 3-in-1 cable',
                price: 899,
                discountPrice: 699,
                category: catMap['electronics'],
                brand: 'RS Automart',
                images: [{ url: '/products/car-charger.png', publicId: 'local-1' }],
                stock: { quantity: 50, status: 'in_stock' },
                tags: ['car charger', 'quick charge', 'usb', '3 in 1'],
                isFeatured: true,
                isBestSeller: true,
                isNewArrival: true,
                warranty: '6 Months Warranty',
                ratings: { average: 4.5, count: 42 },
                totalSold: 185,
            },
            {
                name: 'Diecast Jeep Wrangler Model – 1:32 Scale (White)',
                slug: 'diecast-jeep-wrangler-white',
                sku: 'RSA-002',
                description: 'Premium diecast Jeep Wrangler model car. 1:32 scale, pull-back action, opening doors. Perfect for car enthusiasts and collectors.',
                shortDescription: '1:32 scale Jeep Wrangler diecast model',
                price: 1299,
                discountPrice: 999,
                category: catMap['collectibles'],
                brand: 'RS Automart',
                images: [{ url: '/products/diecast-jeep.png', publicId: 'local-2' }],
                stock: { quantity: 20, status: 'in_stock' },
                tags: ['diecast', 'model car', 'jeep', 'collectible'],
                isFeatured: true,
                isBestSeller: false,
                isNewArrival: true,
                warranty: '7 Days Replacement',
                ratings: { average: 4.7, count: 28 },
                totalSold: 95,
            },
            {
                name: 'Car Console Organizer – Leather with Cup Holder',
                slug: 'car-console-organizer-leather',
                sku: 'RSA-003',
                description: 'Premium PU leather console organizer with tissue box, cup holders, and card slots. Fits between car seats.',
                shortDescription: 'Leather console organizer with cup holders',
                price: 1599,
                discountPrice: 1199,
                category: catMap['interior'],
                brand: 'RS Automart',
                images: [{ url: '/products/console-organizer.png', publicId: 'local-3' }],
                stock: { quantity: 35, status: 'in_stock' },
                tags: ['organizer', 'console', 'leather', 'interior'],
                isFeatured: false,
                isBestSeller: true,
                isNewArrival: true,
                warranty: '30 Days Return',
                ratings: { average: 4.3, count: 56 },
                totalSold: 220,
            },
            {
                name: 'Colum Air Spencer Car Air Freshener – Premium',
                slug: 'colum-air-spencer-freshener',
                sku: 'RSA-004',
                description: 'Japanese Colum Air Spencer premium car air freshener. Long-lasting fragrance, elegant dashboard design.',
                shortDescription: 'Premium Japanese car air freshener',
                price: 1899,
                discountPrice: 1499,
                category: catMap['interior'],
                brand: 'Air Spencer',
                images: [{ url: '/products/air-freshener.png', publicId: 'local-4' }],
                stock: { quantity: 15, status: 'in_stock' },
                tags: ['air freshener', 'car perfume', 'interior', 'air spencer'],
                isFeatured: true,
                isBestSeller: true,
                isNewArrival: false,
                warranty: '7 Days Replacement',
                ratings: { average: 4.6, count: 34 },
                totalSold: 145,
            },
            {
                name: 'Luxury Car Fragrance Gift Set – Gold Edition',
                slug: 'luxury-car-fragrance-gold',
                sku: 'RSA-005',
                description: 'Premium car fragrance gift set with gold bullion design. Solar-powered rotating base. Luxury gift box packaging.',
                shortDescription: 'Gold edition luxury car fragrance set',
                price: 2499,
                discountPrice: 1899,
                category: catMap['interior'],
                brand: 'RS Automart',
                images: [{ url: '/products/car-fragrance.png', publicId: 'local-5' }],
                stock: { quantity: 8, status: 'in_stock' },
                tags: ['fragrance', 'luxury', 'gift', 'gold'],
                isFeatured: true,
                isBestSeller: false,
                isNewArrival: true,
                warranty: '15 Days Return',
                ratings: { average: 4.8, count: 18 },
                totalSold: 62,
            },
            {
                name: 'Portable Car Vacuum Cleaner – Handheld Powerful',
                slug: 'portable-car-vacuum-cleaner',
                sku: 'RSA-006',
                description: 'Powerful handheld car vacuum cleaner with 6000PA suction. Cordless, USB rechargeable. Compact nozzle for tight spaces.',
                shortDescription: 'Cordless handheld car vacuum, 6000PA',
                price: 1999,
                discountPrice: 1499,
                category: catMap['car-care'],
                brand: 'RS Automart',
                images: [{ url: '/products/car-vacuum.png', publicId: 'local-6' }],
                stock: { quantity: 25, status: 'in_stock' },
                tags: ['vacuum', 'car cleaner', 'portable', 'cordless'],
                isFeatured: false,
                isBestSeller: true,
                isNewArrival: true,
                warranty: '6 Months Warranty',
                ratings: { average: 4.4, count: 47 },
                totalSold: 178,
            },
            {
                name: 'DTR Glass Cleaner Spray – Streak Free (500ml)',
                slug: 'dtr-glass-cleaner-spray',
                sku: 'RSA-007',
                description: 'Professional grade glass cleaner spray. Streak-free formula for windshields, mirrors, and windows. 500ml bottle.',
                shortDescription: 'Streak-free glass cleaner, 500ml',
                price: 399,
                discountPrice: 299,
                category: catMap['car-care'],
                brand: 'DTR',
                images: [{ url: '/products/glass-cleaner.png', publicId: 'local-7' }],
                stock: { quantity: 100, status: 'in_stock' },
                tags: ['glass cleaner', 'spray', 'windshield', 'car care'],
                isFeatured: false,
                isBestSeller: true,
                isNewArrival: false,
                warranty: '30 Days Return',
                ratings: { average: 4.2, count: 65 },
                totalSold: 340,
            },
            {
                name: 'Car Seat Cooling Fan – TK1500 Headrest Mount',
                slug: 'car-seat-cooling-fan-tk1500',
                sku: 'RSA-008',
                description: 'Car seat cooling fan that mounts on headrest. 3-speed USB powered. Keeps back cool during summer drives.',
                shortDescription: 'Headrest mount seat cooling fan, USB',
                price: 1799,
                discountPrice: 1399,
                category: catMap['cooling-comfort'],
                brand: 'RS Automart',
                images: [{ url: '/products/seat-cooling-fan.png', publicId: 'local-8' }],
                stock: { quantity: 18, status: 'in_stock' },
                tags: ['cooling fan', 'car seat', 'summer', 'usb fan'],
                isFeatured: true,
                isBestSeller: false,
                isNewArrival: true,
                warranty: '6 Months Warranty',
                ratings: { average: 4.1, count: 22 },
                totalSold: 73,
            },
            {
                name: 'Royal Mazeda Foaming Shampoo – Car & Bike (550ml)',
                slug: 'royal-mazeda-foaming-shampoo',
                sku: 'RSA-009',
                description: 'Max foaming car & bike wash shampoo. Advanced cleaning with shine & protection. 550ml bottle.',
                shortDescription: 'Max foaming car wash shampoo, 550ml',
                price: 599,
                discountPrice: 449,
                category: catMap['car-care'],
                brand: 'Royal Mazeda',
                images: [{ url: '/products/foaming-shampoo.png', publicId: 'local-9' }],
                stock: { quantity: 80, status: 'in_stock' },
                tags: ['shampoo', 'car wash', 'foaming', 'bike wash'],
                isFeatured: false,
                isBestSeller: true,
                isNewArrival: true,
                warranty: '30 Days Return',
                ratings: { average: 4.5, count: 53 },
                totalSold: 290,
            },
            {
                name: 'Double Engine Car Fan – F303 Silicone Hose',
                slug: 'double-engine-car-fan-f303',
                sku: 'RSA-010',
                description: 'Dual head car cooling fan with flexible silicone hose. USB powered, 3-speed, 360° adjustable. TK1600 model.',
                shortDescription: 'Dual head USB car fan, 360° rotation',
                price: 1499,
                discountPrice: 1099,
                category: catMap['cooling-comfort'],
                brand: 'RS Automart',
                images: [{ url: '/products/double-fan.png', publicId: 'local-10' }],
                stock: { quantity: 30, status: 'in_stock' },
                tags: ['car fan', 'cooling', 'dual fan', 'usb'],
                isFeatured: true,
                isBestSeller: true,
                isNewArrival: false,
                warranty: '6 Months Warranty',
                ratings: { average: 4.3, count: 38 },
                totalSold: 156,
            },
            {
                name: 'Diecast Classic BMW 501 Model – 1:32 Scale (Blue)',
                slug: 'diecast-bmw-501-classic-blue',
                sku: 'RSA-011',
                description: 'Premium diecast BMW 501 classic car model. 1:32 scale with pull-back action. Deep blue metallic finish.',
                shortDescription: '1:32 BMW 501 classic diecast model',
                price: 1399,
                discountPrice: 1099,
                category: catMap['collectibles'],
                brand: 'RS Automart',
                images: [{ url: '/products/diecast-classic.png', publicId: 'local-11' }],
                stock: { quantity: 12, status: 'in_stock' },
                tags: ['diecast', 'model car', 'bmw', 'classic', 'collectible'],
                isFeatured: false,
                isBestSeller: false,
                isNewArrival: true,
                warranty: '7 Days Replacement',
                ratings: { average: 4.6, count: 15 },
                totalSold: 48,
            },
            {
                name: 'Bangladesh Flag Dashboard Stand – Solar Powered',
                slug: 'bangladesh-flag-dashboard-stand',
                sku: 'RSA-012',
                description: 'Dual Bangladesh flag stand for car dashboard. Solar powered rotating base with tire-shaped design. Show your pride!',
                shortDescription: 'Solar rotating BD flag dashboard stand',
                price: 499,
                discountPrice: 349,
                category: catMap['car-accessories'],
                brand: 'RS Automart',
                images: [{ url: '/products/bd-flag-stand.png', publicId: 'local-12' }],
                stock: { quantity: 3, status: 'low_stock' },
                tags: ['flag', 'bangladesh', 'dashboard', 'patriotic'],
                isFeatured: true,
                isBestSeller: true,
                isNewArrival: true,
                warranty: '7 Days Replacement',
                ratings: { average: 4.9, count: 72 },
                totalSold: 410,
            },
        ];
        const products = await Product_model_1.default.insertMany(productsData);
        console.log('🛒 Products created:', products.length);
        console.log('\n🌟 --- Seed Complete ---');
        console.log('🔐 Admin Login: admin@rsautomart.com / admin123');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};
seedData();
//# sourceMappingURL=seed.js.map