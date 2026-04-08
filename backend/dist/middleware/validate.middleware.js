"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChangePassword = exports.validateLogin = exports.validateRegistration = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegistration = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            return;
        }
        next();
    },
];
exports.validateLogin = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            return;
        }
        next();
    },
];
exports.validateChangePassword = [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
            return;
        }
        next();
    },
];
//# sourceMappingURL=validate.middleware.js.map