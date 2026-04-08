"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminProducts = exports.updateStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getNewArrivals = exports.getBestSellers = exports.getFeaturedProducts = exports.getProductBySlug = exports.getProducts = void 0;
const slugify_1 = __importDefault(require("slugify"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sort, search, page = '1', limit = '12', brand, tag, } = req.query;
        const filter = { isActive: true };
        if (category)
            filter.category = category;
        if (brand)
            filter.brand = brand;
        if (tag)
            filter.tags = { $in: [tag] };
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
            ];
        }
        let sortOption = { createdAt: -1 };
        switch (sort) {
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'popular':
                sortOption = { totalSold: -1 };
                break;
            case 'rating':
                sortOption = { 'ratings.average': -1 };
                break;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [products, total] = await Promise.all([
            Product_model_1.default.find(filter).populate('category', 'name slug').sort(sortOption).skip(skip).limit(limitNum),
            Product_model_1.default.countDocuments(filter),
        ]);
        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProducts = getProducts;
const getProductBySlug = async (req, res) => {
    try {
        const product = await Product_model_1.default.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
        if (!product) {
            res.status(404).json({ message: 'Product not found.' });
            return;
        }
        res.json({ product });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProductBySlug = getProductBySlug;
const getFeaturedProducts = async (_req, res) => {
    try {
        const products = await Product_model_1.default.find({ isFeatured: true, isActive: true })
            .populate('category', 'name slug')
            .limit(12);
        res.json({ products });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getFeaturedProducts = getFeaturedProducts;
const getBestSellers = async (req, res) => {
    try {
        let sortOption = { totalSold: -1 };
        switch (req.query.sort) {
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'name_asc':
                sortOption = { name: 1 };
                break;
            case 'name_desc':
                sortOption = { name: -1 };
                break;
        }
        const products = await Product_model_1.default.find({ isBestSeller: true, isActive: true })
            .populate('category', 'name slug')
            .sort(sortOption)
            .limit(12);
        res.json({ products });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getBestSellers = getBestSellers;
const getNewArrivals = async (req, res) => {
    try {
        let sortOption = { createdAt: -1 };
        switch (req.query.sort) {
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'popular':
                sortOption = { totalSold: -1 };
                break;
            case 'name_asc':
                sortOption = { name: 1 };
                break;
            case 'name_desc':
                sortOption = { name: -1 };
                break;
        }
        const products = await Product_model_1.default.find({ isNewArrival: true, isActive: true })
            .populate('category', 'name slug')
            .sort(sortOption)
            .limit(12);
        res.json({ products });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getNewArrivals = getNewArrivals;
const createProduct = async (req, res) => {
    try {
        const body = req.body;
        const slug = (0, slugify_1.default)(body.name, { lower: true, strict: true });
        // Auto-generate SKU: RSA-001, RSA-012, etc.
        let sku = body.sku;
        if (!sku) {
            const count = await Product_model_1.default.countDocuments();
            sku = `RSA-${(count + 1).toString().padStart(4, '0')}`;
        }
        const images = [];
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary_1.default.uploader.upload_stream({ folder: 'rs-automart/products', transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }] }, (error, result) => (error ? reject(error) : resolve(result)));
                    stream.end(file.buffer);
                });
                images.push({ url: result.secure_url, publicId: result.public_id });
            }
        }
        // Parse JSON fields
        const variants = body.variants ? JSON.parse(body.variants) : [];
        const specifications = body.specifications ? JSON.parse(body.specifications) : [];
        const tags = body.tags ? JSON.parse(body.tags) : [];
        const product = await Product_model_1.default.create({
            ...body,
            slug,
            sku,
            images,
            variants,
            specifications,
            tags,
            stock: { quantity: body.stockQuantity || 0 },
        });
        res.status(201).json({ product });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const body = req.body;
        const updateData = { ...body };
        if (body.name) {
            updateData.slug = (0, slugify_1.default)(body.name, { lower: true, strict: true });
        }
        if (body.variants)
            updateData.variants = JSON.parse(body.variants);
        if (body.specifications)
            updateData.specifications = JSON.parse(body.specifications);
        if (body.tags)
            updateData.tags = JSON.parse(body.tags);
        if (body.stockQuantity !== undefined) {
            updateData.stock = { quantity: Number(body.stockQuantity) };
        }
        // Handle existing and new images
        const product = await Product_model_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found.' });
            return;
        }
        let updatedImages = product.images;
        // If existingImages is sent, it means the user might have removed some
        if (body.existingImages) {
            const remainingImages = JSON.parse(body.existingImages);
            // Determine which images were removed and delete them from Cloudinary
            const removedImages = product.images.filter((oldImg) => !remainingImages.some((newImg) => newImg.publicId === oldImg.publicId));
            for (const img of removedImages) {
                if (img.publicId)
                    await cloudinary_1.default.uploader.destroy(img.publicId);
            }
            updatedImages = remainingImages;
        }
        // Handle new uploads
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const newImages = [];
            for (const file of req.files) {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary_1.default.uploader.upload_stream({ folder: 'rs-automart/products', transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }] }, (error, result) => (error ? reject(error) : resolve(result)));
                    stream.end(file.buffer);
                });
                newImages.push({ url: result.secure_url, publicId: result.public_id });
            }
            updatedImages = [...updatedImages, ...newImages];
        }
        updateData.images = updatedImages;
        const updatedProduct = await Product_model_1.default.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updatedProduct) {
            res.status(404).json({ message: 'Product not found.' });
            return;
        }
        res.json({ product: updatedProduct });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const product = await Product_model_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found.' });
            return;
        }
        // Delete images from Cloudinary
        for (const img of product.images) {
            if (img.publicId)
                await cloudinary_1.default.uploader.destroy(img.publicId);
        }
        await Product_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteProduct = deleteProduct;
const updateStock = async (req, res) => {
    try {
        const { quantity } = req.body;
        const product = await Product_model_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found.' });
            return;
        }
        product.stock.quantity = quantity;
        await product.save(); // triggers pre-save hook for status update
        res.json({ product });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateStock = updateStock;
const getAdminProducts = async (req, res) => {
    try {
        const { search, page = '1', limit = '20' } = req.query;
        const filter = {};
        if (search) {
            filter.$text = { $search: search };
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [products, total] = await Promise.all([
            Product_model_1.default.find(filter)
                .populate('category', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Product_model_1.default.countDocuments(filter),
        ]);
        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAdminProducts = getAdminProducts;
//# sourceMappingURL=product.controller.js.map