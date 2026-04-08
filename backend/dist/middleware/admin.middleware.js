"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ message: 'Access denied. Admin only.' });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=admin.middleware.js.map