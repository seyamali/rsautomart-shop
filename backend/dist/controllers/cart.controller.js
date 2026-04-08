"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCart = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const Cart_model_1 = __importDefault(require("../models/Cart.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const getCart = async (req, res) => {
    try {
        let cart = await Cart_model_1.default.findOne({ user: req.user._id }).populate('items.product', 'name slug images price discountPrice stock');
        if (!cart) {
            cart = await Cart_model_1.default.create({ user: req.user._id, items: [], totalAmount: 0 });
        }
        res.json({ cart });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCart = getCart;
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, variant } = req.body;
        const product = await Product_model_1.default.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found.' });
            return;
        }
        if (product.stock.status === 'out_of_stock') {
            res.status(400).json({ message: 'Product is out of stock.' });
            return;
        }
        let cart = await Cart_model_1.default.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart_model_1.default({ user: req.user._id, items: [], totalAmount: 0 });
        }
        const price = product.discountPrice || product.price;
        const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId && item.variant === variant);
        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += quantity;
            cart.items[existingIndex].price = price;
        }
        else {
            cart.items.push({ product: productId, quantity, variant, price });
        }
        cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await cart.save();
        const populated = await Cart_model_1.default.findById(cart._id).populate('items.product', 'name slug images price discountPrice stock');
        res.json({ cart: populated });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity, variant } = req.body;
        const cart = await Cart_model_1.default.findOne({ user: req.user._id });
        if (!cart) {
            res.status(404).json({ message: 'Cart not found.' });
            return;
        }
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId && (!variant || item.variant === variant));
        if (itemIndex === -1) {
            res.status(404).json({ message: 'Item not found in cart.' });
            return;
        }
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        }
        else {
            cart.items[itemIndex].quantity = quantity;
        }
        cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await cart.save();
        const populated = await Cart_model_1.default.findById(cart._id).populate('items.product', 'name slug images price discountPrice stock');
        res.json({ cart: populated });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart_model_1.default.findOne({ user: req.user._id });
        if (!cart) {
            res.status(404).json({ message: 'Cart not found.' });
            return;
        }
        cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
        cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await cart.save();
        const populated = await Cart_model_1.default.findById(cart._id).populate('items.product', 'name slug images price discountPrice stock');
        res.json({ cart: populated });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res) => {
    try {
        await Cart_model_1.default.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0 });
        res.json({ message: 'Cart cleared.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.clearCart = clearCart;
const syncCart = async (req, res) => {
    try {
        const { localItems = [] } = req.body;
        let cart = await Cart_model_1.default.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart_model_1.default({ user: req.user._id, items: [], totalAmount: 0 });
        }
        // Merge logic
        for (const localItem of localItems) {
            // localItem structure matches frontend: { product: { _id:... }, quantity, variant, price }
            // Because we send it from the frontend store directly, we parse productId:
            const productId = typeof localItem.product === 'object' ? localItem.product._id : localItem.product;
            const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId && item.variant === localItem.variant);
            if (existingIndex > -1) {
                // If it exists in DB, we could add quantities or just keep the max/DB one. Usually, we add.
                // For safety, let's max them or just take local if local isn't empty. We'll simply ensure it's there. 
                // A common pattern: if user already has it in DB, we don't duplicate, we ensure it's logged.
                // Since local is what they *just* intented to buy, let's take local max or add.
                if (cart.items[existingIndex].quantity < localItem.quantity) {
                    cart.items[existingIndex].quantity = localItem.quantity;
                }
            }
            else {
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
        const populated = await Cart_model_1.default.findById(cart._id).populate('items.product', 'name slug images price discountPrice stock');
        res.json({ cart: populated });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.syncCart = syncCart;
//# sourceMappingURL=cart.controller.js.map