"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const quizAttempts_1 = require("../controllers/quizAttempts");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/', (0, auth_1.authorizeRoles)(['ADMIN', 'TEACHER']), quizAttempts_1.getAllQuizAttempts);
router.get('/student', (0, auth_1.authorizeRoles)(['STUDENT']), quizAttempts_1.getStudentQuizAttempts);
router.get('/student/quiz/:quizId', (0, auth_1.authorizeRoles)(['STUDENT']), quizAttempts_1.getStudentQuizAttemptsByQuiz);
router.get('/quiz/:quizId', (0, auth_1.authorizeRoles)(['ADMIN', 'TEACHER']), quizAttempts_1.getQuizAttemptsByQuiz);
router.get('/:id', quizAttempts_1.getQuizAttemptById);
router.post('/', (0, auth_1.authorizeRoles)(['STUDENT']), quizAttempts_1.createQuizAttempt);
router.delete('/:id', (0, auth_1.authorizeRoles)(['ADMIN', 'TEACHER']), quizAttempts_1.deleteQuizAttempt);
exports.default = router;
//# sourceMappingURL=quizAttempts.js.map