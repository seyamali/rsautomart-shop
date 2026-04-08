"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewOrderNotification = exports.sendOrderConfirmation = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendOrderConfirmation = async (to, orderNumber, totalAmount, items) => {
    const itemsHtml = items
        .map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>৳${item.price}</td></tr>`)
        .join('');
    await transporter.sendMail({
        from: `"RS Automart" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Order Confirmed - ${orderNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Order Confirmed!</h2>
        <p>Thank you for your order. Your order <strong>${orderNumber}</strong> has been placed successfully.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #1a1a2e; color: white;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px;">Qty</th>
              <th style="padding: 10px;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="font-size: 18px;"><strong>Total: ৳${totalAmount}</strong></p>
        <p>We will notify you when your order is shipped.</p>
        <p style="color: #666;">— RS Automart Team</p>
      </div>
    `,
    });
};
exports.sendOrderConfirmation = sendOrderConfirmation;
const sendNewOrderNotification = async (orderNumber, totalAmount, customerName) => {
    if (!process.env.EMAIL_USER)
        return;
    await transporter.sendMail({
        from: `"RS Automart" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `New Order Received - ${orderNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Order Received!</h2>
        <p><strong>Order:</strong> ${orderNumber}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Total:</strong> ৳${totalAmount}</p>
      </div>
    `,
    });
};
exports.sendNewOrderNotification = sendNewOrderNotification;
//# sourceMappingURL=email.service.js.map