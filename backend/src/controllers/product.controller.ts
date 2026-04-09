import { Request, Response } from 'express';
import slugify from 'slugify';
import Product from '../models/Product.model';
import cloudinary from '../config/cloudinary';
import sharp from 'sharp';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sort,
      search,
      page = '1',
      limit = '12',
      brand,
      tag,
    } = req.query;

    const filter: any = { isActive: true };

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (tag) filter.tags = { $in: [tag] };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { sku: { $regex: search as string, $options: 'i' } },
        { brand: { $regex: search as string, $options: 'i' } },
      ];
    }

    let sortOption: any = { createdAt: -1 };
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

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
      'category',
      'name slug'
    );
    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }
    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(12);
    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBestSellers = async (req: Request, res: Response): Promise<void> => {
  try {
    let sortOption: any = { totalSold: -1 };
    switch (req.query.sort) {
      case 'price_asc': sortOption = { price: 1 }; break;
      case 'price_desc': sortOption = { price: -1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'name_asc': sortOption = { name: 1 }; break;
      case 'name_desc': sortOption = { name: -1 }; break;
    }

    const products = await Product.find({ isBestSeller: true, isActive: true })
      .populate('category', 'name slug')
      .sort(sortOption)
      .limit(12);
    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNewArrivals = async (req: Request, res: Response): Promise<void> => {
  try {
    let sortOption: any = { createdAt: -1 };
    switch (req.query.sort) {
      case 'price_asc': sortOption = { price: 1 }; break;
      case 'price_desc': sortOption = { price: -1 }; break;
      case 'popular': sortOption = { totalSold: -1 }; break;
      case 'name_asc': sortOption = { name: 1 }; break;
      case 'name_desc': sortOption = { name: -1 }; break;
    }

    const products = await Product.find({ isNewArrival: true, isActive: true })
      .populate('category', 'name slug')
      .sort(sortOption)
      .limit(12);
    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const slug = slugify(body.name, { lower: true, strict: true });
    
    // Auto-generate SKU: RSA-001, RSA-012, etc.
    let sku = body.sku;
    if (!sku) {
      const count = await Product.countDocuments();
      sku = `RSA-${(count + 1).toString().padStart(4, '0')}`;

    }


    const images: { url: string; publicId: string }[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        // Optimize image with Sharp
        const optimizedBuffer = await sharp(file.buffer)
          .resize(800, 800, { fit: 'cover', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .webp({ quality: 80 })
          .toBuffer();

        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              folder: 'rs-automart/products', 
              format: 'webp',
              resource_type: 'image'
            },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(optimizedBuffer);
        });
        images.push({ url: result.secure_url, publicId: result.public_id });
      }
    }

    // Parse JSON fields
    const variants = body.variants ? JSON.parse(body.variants) : [];
    const specifications = body.specifications ? JSON.parse(body.specifications) : [];
    const tags = body.tags ? JSON.parse(body.tags) : [];

    const product = await Product.create({
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const updateData: any = { ...body };

    if (body.name) {
      updateData.slug = slugify(body.name, { lower: true, strict: true });
    }
    if (body.variants) updateData.variants = JSON.parse(body.variants);
    if (body.specifications) updateData.specifications = JSON.parse(body.specifications);
    if (body.tags) updateData.tags = JSON.parse(body.tags);
    if (body.stockQuantity !== undefined) {
      updateData.stock = { quantity: Number(body.stockQuantity) };
    }

    // Handle existing and new images
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    let updatedImages = product.images;

    // If existingImages is sent, it means the user might have removed some
    if (body.existingImages) {
      const remainingImages = JSON.parse(body.existingImages);
      
      // Determine which images were removed and delete them from Cloudinary
      const removedImages = product.images.filter(
        (oldImg) => !remainingImages.some((newImg: any) => newImg.publicId === oldImg.publicId)
      );

      for (const img of removedImages) {
        if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
      }
      
      updatedImages = remainingImages;
    }

    // Handle new uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImages: { url: string; publicId: string }[] = [];

      for (const file of req.files) {
        // Optimize with Sharp
        const optimizedBuffer = await sharp(file.buffer)
          .resize(800, 800, { fit: 'cover', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .webp({ quality: 80 })
          .toBuffer();

        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { 
              folder: 'rs-automart/products',
              format: 'webp',
              resource_type: 'image'
            },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(optimizedBuffer);
        });
        newImages.push({ url: result.secure_url, publicId: result.public_id });
      }

      updatedImages = [...updatedImages, ...newImages];
    }

    updateData.images = updatedImages;


    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }
    res.json({ product: updatedProduct });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }
    // Delete images from Cloudinary
    for (const img of product.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }
    product.stock.quantity = quantity;
    await product.save(); // triggers pre-save hook for status update
    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getAdminProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, page = '1', limit = '20' } = req.query;
    const filter: any = {};

    if (search) {
      filter.$text = { $search: search as string };
    }

    if (category) {
      filter.category = category;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
