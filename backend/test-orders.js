const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Order = require('./dist/models/Order.model').default;
    const orders = await Order.find({});
    console.log('--- FOUND ORDERS IN DB ---');
    console.log('Count:', orders.length);
    orders.forEach(o => console.log('Order:', o.orderNumber, o.user));
    process.exit(0);
}).catch(console.error);
