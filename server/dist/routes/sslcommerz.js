"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const sslcommerz_1 = require("../controllers/sslcommerz");
const router = express_1.default.Router();
router.post('/create-session', auth_1.authenticateToken, sslcommerz_1.createPaymentSession);
router.post('/success', sslcommerz_1.paymentSuccess);
router.post('/fail', sslcommerz_1.paymentFail);
router.post('/cancel', sslcommerz_1.paymentCancel);
router.post('/ipn', sslcommerz_1.paymentIPN);
exports.default = router;
//# sourceMappingURL=sslcommerz.js.map