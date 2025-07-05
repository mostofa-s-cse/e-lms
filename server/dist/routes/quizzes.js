"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const quizzes_1 = require("../controllers/quizzes");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, quizzes_1.getAllQuizzes);
router.get('/course/:courseId', auth_1.authenticateToken, quizzes_1.getQuizzesByCourse);
router.get('/:id', auth_1.authenticateToken, quizzes_1.getQuizById);
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['TEACHER', 'ADMIN']), quizzes_1.createQuiz);
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['TEACHER', 'ADMIN']), quizzes_1.updateQuiz);
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['TEACHER', 'ADMIN']), quizzes_1.deleteQuiz);
exports.default = router;
//# sourceMappingURL=quizzes.js.map