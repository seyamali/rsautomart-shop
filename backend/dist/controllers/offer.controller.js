"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOffer = exports.updateOffer = exports.createOffer = exports.getAdminOffers = exports.getOffers = void 0;
const Offer_model_1 = __importDefault(require("../models/Offer.model"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const parseIdList = (value) => {
    if (!value)
        return [];
    if (Array.isArray(value))
        return value.map(String).filter(Boolean);
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed))
                return parsed.map(String).filter(Boolean);
        }
        catch { }
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return [];
};
const parseBoolean = (value, fallback = true) => {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'string') {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
    }
    return fallback;
};
const buildOfferPayload = (body) => {
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const discountPercent = Number(body.discountPercent || 0);
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const products = parseIdList(body.products);
    const categories = parseIdList(body.categories);
    const bannerUrl = String(body.bannerUrl || '').trim();
    const bannerPublicId = String(body.bannerPublicId || '').trim();
    const payload = {
        title,
        description,
        discountPercent,
        products,
        categories,
        startDate,
        endDate,
        isActive: parseBoolean(body.isActive, true),
    };
    if (bannerUrl) {
        payload.banner = {
            url: bannerUrl,
            publicId: bannerPublicId,
        };
    }
    return payload;
};
const populateOffer = (query) => query.populate('products', 'name slug price discountPrice images').populate('categories', 'name slug');
const getOffers = async (_req, res) => {
    try {
        const offers = await populateOffer(Offer_model_1.default.find({
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
        }).sort({ createdAt: -1 }));
        res.json({ offers });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getOffers = getOffers;
const getAdminOffers = async (_req, res) => {
    try {
        const offers = await populateOffer(Offer_model_1.default.find().sort({ createdAt: -1 }));
        res.json({ offers });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAdminOffers = getAdminOffers;
const createOffer = async (req, res) => {
    try {
        const payload = buildOfferPayload(req.body);
        const offer = await Offer_model_1.default.create(payload);
        res.status(201).json({ offer });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createOffer = createOffer;
const updateOffer = async (req, res) => {
    try {
        const existing = await Offer_model_1.default.findById(req.params.id);
        if (!existing) {
            res.status(404).json({ message: 'Offer not found.' });
            return;
        }
        const payload = buildOfferPayload(req.body);
        if (!payload.banner && existing.banner) {
            payload.banner = existing.banner;
        }
        const offer = await Offer_model_1.default.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
        if (!offer) {
            res.status(404).json({ message: 'Offer not found.' });
            return;
        }
        res.json({ offer });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateOffer = updateOffer;
const deleteOffer = async (req, res) => {
    try {
        const offer = await Offer_model_1.default.findById(req.params.id);
        if (!offer) {
            res.status(404).json({ message: 'Offer not found.' });
            return;
        }
        if (offer.banner?.publicId) {
            try {
                await cloudinary_1.default.uploader.destroy(offer.banner.publicId);
            }
            catch { }
        }
        await Offer_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Offer deleted.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteOffer = deleteOffer;
//# sourceMappingURL=offer.controller.js.map