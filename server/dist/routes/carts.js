"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const carts_1 = require("../controllers/carts");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', carts_1.getCart);
router.post('/', carts_1.createOrUpdateCart);
router.post('/add', carts_1.addToCart);
router.delete('/items/:itemId', carts_1.removeFromCart);
router.delete('/clear', carts_1.clearCart);
router.post('/merge', auth_1.authenticateToken, carts_1.mergeGuestCart);
exports.default = router;
//# sourceMappingURL=carts.js.map