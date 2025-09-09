"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contact_1 = require("../controllers/contact");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/submit', contact_1.submitContactForm);
router.get('/messages', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), contact_1.getContactMessages);
router.put('/messages/:id/status', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), contact_1.updateContactMessageStatus);
router.delete('/messages/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), contact_1.deleteContactMessage);
exports.default = router;
//# sourceMappingURL=contact.js.map