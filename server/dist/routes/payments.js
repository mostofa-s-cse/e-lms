"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const payments_1 = require("../controllers/payments");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/create', payments_1.createCustomPayment);
router.post('/create-cart', payments_1.createCartPayment);
router.post('/free-enrollment', payments_1.createFreeEnrollment);
router.get('/', payments_1.getAllPayments);
router.get('/:id', payments_1.getPaymentById);
router.get('/user/:userId', payments_1.getPaymentsByUser);
router.get('/enrollment/:enrollmentId', payments_1.getPaymentsByEnrollment);
router.post('/', payments_1.createPayment);
router.put('/:id', payments_1.updatePayment);
router.delete('/:id', payments_1.deletePayment);
router.patch('/:id/complete', payments_1.markPaymentCompleted);
exports.default = router;
//# sourceMappingURL=payments.js.map