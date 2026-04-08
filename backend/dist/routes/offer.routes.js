"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const offer_controller_1 = require("../controllers/offer.controller");
const router = (0, express_1.Router)();
router.get('/', offer_controller_1.getOffers);
router.get('/admin', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, offer_controller_1.getAdminOffers);
router.post('/', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, offer_controller_1.createOffer);
router.put('/:id', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, offer_controller_1.updateOffer);
router.delete('/:id', auth_middleware_1.verifyToken, admin_middleware_1.isAdmin, offer_controller_1.deleteOffer);
exports.default = router;
//# sourceMappingURL=offer.routes.js.map