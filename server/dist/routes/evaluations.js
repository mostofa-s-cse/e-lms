"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const evaluations_1 = require("../controllers/evaluations");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, evaluations_1.getAllEvaluations);
router.get('/course/:courseId', auth_1.authenticateToken, evaluations_1.getEvaluationsByCourse);
router.get('/:id', auth_1.authenticateToken, evaluations_1.getEvaluationById);
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['TEACHER', 'ADMIN']), evaluations_1.createEvaluation);
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['TEACHER', 'ADMIN']), evaluations_1.updateEvaluation);
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['TEACHER', 'ADMIN']), evaluations_1.deleteEvaluation);
exports.default = router;
//# sourceMappingURL=evaluations.js.map