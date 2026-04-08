import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.model';
import Category from './models/Category.model';

dotenv.config();

const updateCategoryImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Mapping of category slugs to a key product image
    const mapping: Record<string, string> = {
      'car-accessories': 'RSA-012', // Bangladesh Flag Stand
      'car-care': 'RSA-007',        // DTR Glass Cleaner
      'electronics': 'RSA-001',      // Quick Charge Car Charger
      'interior': 'RSA-003',         // Car Console Organizer
      'collectibles': 'RSA-002',     // Diecast Jeep Wrangler
      'cooling-comfort': 'RSA-008',   // Car Seat Cooling Fan
    };

    for (const [slug, sku] of Object.entries(mapping)) {
      const product = await Product.findOne({ sku });
      const category = await Category.findOne({ slug });

      if (product && category && product.images.length > 0) {
        console.log(`🖼️ Assigning image for ${category.name}: ${product.images[0].url}`);
        await Category.findByIdAndUpdate(category._id, {
          image: {
            url: product.images[0].url,
            publicId: product.images[0].publicId
          }
        });
      } else {
        console.warn(`⚠️ Could not find product with SKU ${sku} or category ${slug}`);
      }
    }

    console.log('\n🌟 --- Category Images Updated ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
};

updateCategoryImages();
