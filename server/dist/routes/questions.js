"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const questions_1 = require("../controllers/questions");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/', questions_1.getAllQuestions);
router.get('/:id', questions_1.getQuestionById);
router.get('/quiz/:quizId', questions_1.getQuestionsByQuiz);
router.post('/', questions_1.createQuestion);
router.put('/:id', questions_1.updateQuestion);
router.delete('/:id', questions_1.deleteQuestion);
exports.default = router;
//# sourceMappingURL=questions.js.map