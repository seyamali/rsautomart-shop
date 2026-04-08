"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.get('/admin', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, category_controller_1.getAdminCategories);
router.get('/', category_controller_1.getCategories);
router.get('/:slug', category_controller_1.getCategoryBySlug);
router.post('/', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, upload_middleware_1.upload.single('image'), category_controller_1.createCategory);
router.put('/:id', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, upload_middleware_1.upload.single('image'), category_controller_1.updateCategory);
router.delete('/:id', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, category_controller_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map