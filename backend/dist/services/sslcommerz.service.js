"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTransaction = exports.initSSLCommerz = void 0;
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const store_id = process.env.SSLCOMMERZ_STORE_ID || '';
const store_passwd = process.env.SSLCOMMERZ_STORE_PASS || '';
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';
const initSSLCommerz = async (data) => {
    const sslcz = new sslcommerz_lts_1.default(store_id, store_passwd, is_live);
    const paymentData = {
        ...data,
        currency: 'BDT',
        shipping_method: 'Courier',
        product_profile: 'physical-goods',
        success_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/success`,
        fail_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/fail`,
        cancel_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/fail`,
        ipn_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/ipn`,
        cus_country: 'Bangladesh',
        ship_name: data.cus_name,
        ship_add1: data.cus_add1,
        ship_city: data.cus_city,
        ship_postcode: '1000',
        ship_country: 'Bangladesh',
    };
    return sslcz.init(paymentData);
};
exports.initSSLCommerz = initSSLCommerz;
const validateTransaction = async (val_id) => {
    const sslcz = new sslcommerz_lts_1.default(store_id, store_passwd, is_live);
    return sslcz.validate({ val_id });
};
exports.validateTransaction = validateTransaction;
//# sourceMappingURL=sslcommerz.service.js.map