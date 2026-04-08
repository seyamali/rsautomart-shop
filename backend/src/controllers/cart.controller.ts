import { Response } from 'express';
import Cart from '../models/Cart.model';
import Product from '../models/Product.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name slug images price discountPrice stock'
    );
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], totalAmount: 0 });
    }
    res.json({ cart });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }
    if (product.stock.status === 'out_of_stock') {
      res.status(400).json({ message: 'Product is out of stock.' });
      return;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [], totalAmount: 0 });
    }

    const price = product.discountPrice || product.price;
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.variant === variant
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].price = price;
    } else {
      cart.items.push({ product: productId, quantity, variant, price });
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      'items.product',
      'name slug images price discountPrice stock'
    );
    res.json({ cart: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity, variant } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404).json({ message: 'Cart not found.' });
      return;
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && (!variant || item.variant === variant)
    );

    if (itemIndex === -1) {
      res.status(404).json({ message: 'Item not found in cart.' });
      return;
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      'items.product',
      'name slug images price discountPrice stock'
    );
    res.json({ cart: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404).json({ message: 'Cart not found.' });
      return;
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      'items.product',
      'name slug images price discountPrice stock'
    );
    res.json({ cart: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], totalAmount: 0 }
    );
    res.json({ message: 'Cart cleared.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { localItems = [] } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [], totalAmount: 0 });
    }

    // Merge logic
    for (const localItem of localItems) {
      // localItem structure matches frontend: { product: { _id:... }, quantity, variant, price }
      // Because we send it from the frontend store directly, we parse productId:
      const productId = typeof localItem.product === 'object' ? localItem.product._id : localItem.product;
      
      const existingIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId && item.variant === localItem.variant
      );

      if (existingIndex > -1) {
        // If it exists in DB, we could add quantities or just keep the max/DB one. Usually, we add.
        // For safety, let's max them or just take local if local isn't empty. We'll simply ensure it's there. 
        // A common pattern: if user already has it in DB, we don't duplicate, we ensure it's logged.
        // Since local is what they *just* intented to buy, let's take local max or add.
        if (cart.items[existingIndex].quantity < localItem.quantity) {
          cart.items[existingIndex].quantity = localItem.quantity;
        }
      } else {
        const itemPrice = localItem.price || 0;
        cart.items.push({
          product: productId,
          quantity: localItem.quantity,
          variant: localItem.variant,
          price: itemPrice,
        });
      }
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      'items.product',
      'name slug images price discountPrice stock'
    );
    res.json({ cart: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

