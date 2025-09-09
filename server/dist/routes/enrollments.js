"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enrollments_1 = require("../controllers/enrollments");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/pending', enrollments_1.getPendingEnrollments);
router.get('/', enrollments_1.getAllEnrollments);
router.get('/:id', enrollments_1.getEnrollmentById);
router.get('/student/:studentId', enrollments_1.getEnrollmentsByStudent);
router.get('/course/:courseId', enrollments_1.getEnrollmentsByCourse);
router.get('/student/:studentId/course/:courseId', enrollments_1.getEnrollmentByStudentAndCourse);
router.post('/', enrollments_1.createEnrollment);
router.patch('/:id/status', enrollments_1.updateEnrollmentStatus);
router.patch('/:id/approve', enrollments_1.approveEnrollment);
router.patch('/:id/reject', enrollments_1.rejectEnrollment);
router.delete('/:id', enrollments_1.deleteEnrollment);
exports.default = router;
//# sourceMappingURL=enrollments.js.map