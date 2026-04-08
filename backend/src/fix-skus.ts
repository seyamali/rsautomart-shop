import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.model';

dotenv.config();

const fixSkus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({ sku: { $regex: /^RSA-\d{3}$/ } });
    console.log(`🔍 Found ${products.length} products with 3-digit SKUs`);

    for (const product of products) {
      const oldSku = product.sku;
      const number = oldSku.split('-')[1];
      const newSku = `RSA-${number.padStart(4, '0')}`;

      console.log(`🔄 Updating: ${oldSku} ➔ ${newSku}`);
      await Product.findByIdAndUpdate(product._id, { sku: newSku });
    }

    console.log('\n🌟 --- SKU Migration Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

fixSkus();
