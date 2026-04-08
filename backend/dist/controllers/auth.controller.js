"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id: String(id) }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};
const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const existingUser = await User_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered.' });
            return;
        }
        const user = await User_model_1.default.create({ name, email, phone, password });
        const token = generateToken(user._id);
        res.cookie('token', token, cookieOptions);
        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_model_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password.' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password.' });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({ message: 'Account is deactivated.' });
            return;
        }
        const token = generateToken(user._id);
        res.cookie('token', token, cookieOptions);
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await User_model_1.default.findById(req.user._id).populate('wishlist');
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const user = await User_model_1.default.findByIdAndUpdate(req.user._id, { name, phone, address }, { new: true, runValidators: true });
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_model_1.default.findById(req.user._id).select('+password');
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(400).json({ message: 'Current password is incorrect.' });
            return;
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password changed successfully.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.changePassword = changePassword;
const logout = async (_req, res) => {
    res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
    res.json({ message: 'Logged out successfully.' });
};
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map