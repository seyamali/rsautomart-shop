import { Request, Response } from 'express';
import Order from '../models/Order.model';
import Cart from '../models/Cart.model';
import Product from '../models/Product.model';
import Coupon from '../models/Coupon.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendOrderConfirmation, sendNewOrderNotification } from '../services/email.service';
import { checkCouponEligibility } from '../services/coupon.service';

const DHAKA_DISTRICTS = ['dhaka', 'gazipur', 'narayanganj', 'manikganj', 'munshiganj', 'narsingdi'];
const FREE_SHIPPING_MIN = 999;
const isInsideDhaka = (shippingAddress: { district?: string; division?: string }) => {
  const district = shippingAddress.district?.trim().toLowerCase();
  const division = shippingAddress.division?.trim().toLowerCase();
  return division === 'dhaka' || (district ? DHAKA_DISTRICTS.includes(district) : false);
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shippingAddress, paymentMethod, couponCode, deliveryNote, items: directItems } = req.body;

    // 1. Gather Items & Secure Prices from Database
    let validatedItems: any[] = [];
    if (directItems && directItems.length > 0) {
      for (const item of directItems) {
        const product = await Product.findById(item.product);
        if (!product || !product.isActive) {
          res.status(404).json({ message: `Product ${item.name || 'Unknown'} not found.` });
          return;
        }
        if (product.stock.quantity < item.quantity) {
          res.status(400).json({ message: `Insufficient stock for ${product.name}.` });
          return;
        }
        validatedItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0]?.url || '',
          price: product.price, // SOURCE OF TRUTH
          quantity: item.quantity,
          variant: item.variant,
        });
      }
    } else {
      if (!req.user) {
        res.status(400).json({ message: 'No items provided.' });
        return;
      }
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        res.status(400).json({ message: 'Cart is empty.' });
        return;
      }
      for (const item of cart.items) {
        const product = item.product as any;
        if (!product || !product.isActive) continue;
        if (product.stock.quantity < item.quantity) {
          res.status(400).json({ message: `Insufficient stock for ${product.name}.` });
          return;
        }
        validatedItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0]?.url || '',
          price: product.price, // SOURCE OF TRUTH
          quantity: item.quantity,
          variant: item.variant,
        });
      }
    }

    if (validatedItems.length === 0) {
      res.status(400).json({ message: 'No valid items in order.' });
      return;
    }

    const orderItems = validatedItems;
    // 2. Calculate Secure Totals
    const subtotal = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    
    // Check shipping
    const district = shippingAddress.district?.trim().toLowerCase();
    const division = shippingAddress.division?.trim().toLowerCase();
    const isDhaka = division === 'dhaka' || (district ? DHAKA_DISTRICTS.includes(district) : false);
    
    let shippingCost = isDhaka ? 60 : 120;
    if (subtotal >= FREE_SHIPPING_MIN) shippingCost = 0;

    let discount = 0;
    const normalizedCouponCode = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : '';
    if (normalizedCouponCode) {
      const result = await checkCouponEligibility({
        code: normalizedCouponCode,
        orderAmount: subtotal,
        userId: req.user?._id?.toString() || '',
      });
      discount = result.discount;
    }
    const totalAmount = subtotal + shippingCost - discount;

    // 3. Create the Order
    const order = await Order.create({
      user: req.user?._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: 'pending',
      subtotal,
      shippingCost,
      discount,
      totalAmount,
      couponCode: normalizedCouponCode || undefined,
      deliveryNote,
    });

    // 4. Reduce Stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'stock.quantity': -item.quantity, totalSold: item.quantity },
      });
    }

    // 5. Cleanup
    if (req.user && (!directItems || directItems.length === 0)) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0 });
    }

    if (normalizedCouponCode && (paymentMethod === 'COD' || paymentMethod === 'bKash')) {
      await Coupon.findOneAndUpdate({ code: normalizedCouponCode }, { $inc: { usedCount: 1 } });
    }

    // 6. Notifications
    try {
      const customerEmail = req.user?.email || shippingAddress?.email;
      const customerName = req.user?.name || shippingAddress?.name || 'Customer';
      
      await sendOrderConfirmation(customerEmail, order.orderNumber, totalAmount, orderItems);
      await sendNewOrderNotification(order.orderNumber, totalAmount, customerName);
    } catch (e) {
      console.error('Email error:', e);
    }

    res.status(201).json({ order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name sku images');

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    if (req.user.role !== 'admin' && (!order.user || order.user._id?.toString() !== req.user._id.toString())) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20', search } = req.query;
    const filter: any = {};
    if (status) filter.orderStatus = status;

    const pageNum  = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip     = (pageNum - 1) * limitNum;

    let orderQuery = Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    let countQuery = Order.countDocuments(filter);

    if (search) {
      const raw = await Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .lean();

      const term = (search as string).toLowerCase();
      const filtered = raw.filter((o: any) =>
        o.orderNumber?.toLowerCase().includes(term) ||
        o.user?.name?.toLowerCase().includes(term) ||
        o.user?.phone?.toLowerCase().includes(term)
      );

      const paginated = filtered.slice(skip, skip + limitNum);
      res.json({
        orders: paginated,
        pagination: { page: pageNum, limit: limitNum, total: filtered.length, pages: Math.ceil(filtered.length / limitNum) },
      });
      return;
    }

    const [orders, total] = await Promise.all([orderQuery, countQuery]);

    res.json({
      orders,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderStatus, paymentStatus, trackingId } = req.body;
    const update: any = {};
    if (orderStatus !== undefined)   update.orderStatus   = orderStatus;
    if (paymentStatus !== undefined) update.paymentStatus = paymentStatus;
    if (trackingId !== undefined)    update.trackingId    = trackingId;

    if (Object.keys(update).length === 0) {
      res.status(400).json({ message: 'No update fields provided.' });
      return;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
      .populate('user', 'name email phone')
      .populate('items.product', 'name sku');

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }
    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
