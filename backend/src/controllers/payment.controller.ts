import { Request, Response } from 'express';
import Order from '../models/Order.model';
import { initSSLCommerz } from '../services/sslcommerz.service';
import Coupon from '../models/Coupon.model';

export const initPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('user', 'name email phone');

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    const user = order.user as any;
    const result = await initSSLCommerz({
      total_amount: order.totalAmount,
      tran_id: String(order._id),
      cus_name: user.name,
      cus_email: user.email,
      cus_phone: order.shippingAddress.phone,
      cus_add1: order.shippingAddress.address,
      cus_city: order.shippingAddress.district,
      product_name: order.items.map((i) => i.name).join(', '),
      product_category: 'General',
    });

    console.log('[SSLCommerz] Result:', JSON.stringify(result));
    if (result?.GatewayPageURL) {
      res.json({ url: result.GatewayPageURL });
    } else {
      res.status(500).json({ message: result?.failedreason || result?.status || 'Payment gateway initialization failed.' });
    }
  } catch (error: any) {
    console.error('[SSLCommerz] Exception:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const paymentSuccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tran_id, val_id } = req.body;
    const order = await Order.findByIdAndUpdate(tran_id, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      sslTransactionId: val_id,
    }, { new: true });

    // Increment coupon usage
    if (order?.couponCode) {
      await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
    }

    res.redirect(`${process.env.FRONTEND_URL}/order-success?orderId=${tran_id}${order?.orderNumber ? `&orderNumber=${encodeURIComponent(order.orderNumber)}` : ''}`);
  } catch (error: any) {
    res.redirect(`${process.env.FRONTEND_URL}/order-failed`);
  }
};

export const paymentFail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tran_id } = req.body;
    await Order.findByIdAndUpdate(tran_id, { paymentStatus: 'failed' });
    res.redirect(`${process.env.FRONTEND_URL}/order-failed`);
  } catch {
    res.redirect(`${process.env.FRONTEND_URL}/order-failed`);
  }
};
