import { Router, Request, Response } from 'express';
import Order from '../models/Order.model';
import Product from '../models/Product.model';
import User from '../models/User.model';
import { verifyToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

router.use(verifyToken, isAdmin);

// Dashboard stats
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const [totalOrders, totalRevenue, totalProducts, totalCustomers] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'customer' }),
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalProducts,
        totalCustomers,
      },
      recentOrders,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Sales chart data
router.get('/sales-chart', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: { $in: ['paid', 'pending'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ salesData });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Low stock products
router.get('/low-stock', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({ 'stock.quantity': { $lt: 5 }, isActive: true })
      .select('name sku stock images')
      .sort({ 'stock.quantity': 1 });
    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// All customers
router.get('/customers', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search } = req.query;
    const filter: any = { role: 'customer' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({
      customers,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Order Management (Centralized)
import { getAllOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller';
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id', updateOrderStatus);

export default router;
