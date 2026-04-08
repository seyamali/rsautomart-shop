"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_model_1.default.findById(decoded.id);
        if (!user || !user.isActive) {
            res.status(401).json({ message: 'Invalid token or user deactivated.' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
exports.verifyToken = verifyToken;
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = await User_model_1.default.findById(decoded.id);
        }
    }
    catch { }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map