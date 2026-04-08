"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
router.post('/register', validate_middleware_1.validateRegistration, auth_controller_1.register);
router.post('/login', validate_middleware_1.validateLogin, auth_controller_1.login);
router.post('/logout', auth_controller_1.logout);
router.get('/me', auth_middleware_1.verifyToken, auth_controller_1.getMe);
router.put('/profile', auth_middleware_1.verifyToken, auth_controller_1.updateProfile);
router.put('/change-password', auth_middleware_1.verifyToken, validate_middleware_1.validateChangePassword, auth_controller_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map