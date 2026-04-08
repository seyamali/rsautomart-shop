import { Request, Response } from 'express';
import Offer from '../models/Offer.model';
import cloudinary from '../config/cloudinary';

type UploadAsset = {
  url: string;
  publicId: string;
};

const parseIdList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const parseBoolean = (value: unknown, fallback = true): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return fallback;
};

const buildOfferPayload = (body: Request['body']) => {
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const discountPercent = Number(body.discountPercent || 0);
  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);
  const products = parseIdList(body.products);
  const categories = parseIdList(body.categories);
  const bannerUrl = String(body.bannerUrl || '').trim();
  const bannerPublicId = String(body.bannerPublicId || '').trim();

  const payload: Record<string, unknown> = {
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

const populateOffer = (query: ReturnType<typeof Offer.find> | ReturnType<typeof Offer.findById>) =>
  query.populate('products', 'name slug price discountPrice images').populate('categories', 'name slug');

export const getOffers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const offers = await populateOffer(
      Offer.find({
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      }).sort({ createdAt: -1 })
    );
    res.json({ offers });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminOffers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const offers = await populateOffer(Offer.find().sort({ createdAt: -1 }));
    res.json({ offers });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = buildOfferPayload(req.body);
    const offer = await Offer.create(payload);
    res.status(201).json({ offer });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Offer.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: 'Offer not found.' });
      return;
    }

    const payload = buildOfferPayload(req.body);
    if (!payload.banner && existing.banner) {
      payload.banner = existing.banner;
    }

    const offer = await Offer.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!offer) {
      res.status(404).json({ message: 'Offer not found.' });
      return;
    }

    res.json({ offer });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      res.status(404).json({ message: 'Offer not found.' });
      return;
    }

    if (offer.banner?.publicId) {
      try {
        await cloudinary.uploader.destroy(offer.banner.publicId);
      } catch {}
    }

    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
