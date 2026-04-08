import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import Product from './models/Product.model';
import Category from './models/Category.model';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const migrateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({ 'images.url': { $regex: /^\/products\// } });
    console.log(`🔍 Found ${products.length} products with local images`);

    // Base path to the frontend public folder
    const publicPath = path.join(__dirname, '..', '..', 'frontend', 'public');

    for (const product of products) {
      console.log(`🔼 Uploading images for product: ${product.name}`);
      const newImages = [];

      for (const img of product.images) {
        if (img.url.startsWith('/products/')) {
          const filePath = path.join(publicPath, img.url);

          if (fs.existsSync(filePath)) {
            const result = await cloudinary.uploader.upload(filePath, {
              folder: 'rs-automart/products',
              use_filename: true,
              unique_filename: false,
              overwrite: true,
            });
            console.log(`   - Uploaded: ${img.url} -> ${result.secure_url}`);
            newImages.push({ url: result.secure_url, publicId: result.public_id });
          } else {
            console.warn(`   - ❌ File not found: ${filePath}`);
            newImages.push(img); // keep old if not found
          }
        } else {
          newImages.push(img);
        }
      }

      await Product.findByIdAndUpdate(product._id, { images: newImages });
    }

    console.log('\n🌟 --- Migration Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateImages();
