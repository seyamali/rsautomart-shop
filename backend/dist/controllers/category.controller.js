"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryBySlug = exports.getCategories = void 0;
const slugify_1 = __importDefault(require("slugify"));
const Category_model_1 = __importDefault(require("../models/Category.model"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const getCategories = async (_req, res) => {
    try {
        const categories = await Category_model_1.default.find({ isActive: true }).populate('parent', 'name slug');
        res.json({ categories });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCategories = getCategories;
const getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category_model_1.default.findOne({ slug: req.params.slug, isActive: true });
        if (!category) {
            res.status(404).json({ message: 'Category not found.' });
            return;
        }
        res.json({ category });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
const createCategory = async (req, res) => {
    try {
        const { name, description, parent } = req.body;
        const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
        let image;
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({ folder: 'rs-automart/categories' }, (error, result) => (error ? reject(error) : resolve(result)));
                stream.end(req.file.buffer);
            });
            image = { url: result.secure_url, publicId: result.public_id };
        }
        const category = await Category_model_1.default.create({ name, slug, description, parent, image });
        res.status(201).json({ category });
    }
    catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { name, description, parent, isActive } = req.body;
        const updateData = { description, parent, isActive };
        if (name) {
            updateData.name = name;
            updateData.slug = (0, slugify_1.default)(name, { lower: true, strict: true });
        }
        if (req.file) {
            const existing = await Category_model_1.default.findById(req.params.id);
            if (existing?.image?.publicId) {
                await cloudinary_1.default.uploader.destroy(existing.image.publicId);
            }
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({ folder: 'rs-automart/categories' }, (error, result) => (error ? reject(error) : resolve(result)));
                stream.end(req.file.buffer);
            });
            updateData.image = { url: result.secure_url, publicId: result.public_id };
        }
        const category = await Category_model_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!category) {
            res.status(404).json({ message: 'Category not found.' });
            return;
        }
        res.json({ category });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const category = await Category_model_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'Category not found.' });
            return;
        }
        if (category.image?.publicId) {
            await cloudinary_1.default.uploader.destroy(category.image.publicId);
        }
        await Category_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteCategory = deleteCategory;
const getAdminCategories = async (_req, res) => {
    try {
        const categories = await Category_model_1.default.find().populate('parent', 'name slug');
        res.json({ categories });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAdminCategories = getAdminCategories;
//# sourceMappingURL=category.controller.js.map