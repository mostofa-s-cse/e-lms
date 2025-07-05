"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuiz = exports.updateQuiz = exports.createQuiz = exports.getQuizzesByCourse = exports.getQuizById = exports.getAllQuizzes = void 0;
const database_1 = require("../utils/database");
const getAllQuizzes = async (req, res, next) => {
    try {
        const quizzes = await database_1.prisma.quiz.findMany({
            where: { isActive: true },
            include: {
                course: {
                    select: { id: true, title: true, code: true }
                },
                author: {
                    select: { id: true, firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, message: 'Quizzes fetched successfully', data: quizzes });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllQuizzes = getAllQuizzes;
const getQuizById = async (req, res, next) => {
    try {
        const quiz = await database_1.prisma.quiz.findUnique({
            where: { id: req.params.id },
            include: {
                course: {
                    select: { id: true, title: true, code: true }
                },
                author: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });
        if (!quiz) {
            res.status(404).json({ success: false, message: 'Quiz not found' });
            return;
        }
        res.json({ success: true, message: 'Quiz fetched successfully', data: quiz });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuizById = getQuizById;
const getQuizzesByCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const quizzes = await database_1.prisma.quiz.findMany({
            where: { courseId },
            include: {
                questions: {
                    select: {
                        id: true,
                        question: true,
                        type: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: quizzes,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuizzesByCourse = getQuizzesByCourse;
const createQuiz = async (req, res, next) => {
    try {
        const { title, description, duration, totalMarks, passingMarks, courseId } = req.body;
        const teacherId = req.user.id;
        const course = await database_1.prisma.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }
        if (course.teacherId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only create quizzes for your own courses' });
            return;
        }
        const quiz = await database_1.prisma.quiz.create({
            data: {
                title,
                description,
                duration: duration || 30,
                totalMarks: totalMarks || 100,
                passingMarks: passingMarks || 70,
                courseId,
                authorId: teacherId
            },
            include: {
                course: {
                    select: { id: true, title: true, code: true }
                },
                author: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });
        res.status(201).json({ success: true, message: 'Quiz created successfully', data: quiz });
    }
    catch (error) {
        next(error);
    }
};
exports.createQuiz = createQuiz;
const updateQuiz = async (req, res, next) => {
    try {
        const { title, description, duration, totalMarks, passingMarks, isActive } = req.body;
        const quizId = req.params.id;
        const teacherId = req.user.id;
        const existingQuiz = await database_1.prisma.quiz.findUnique({
            where: { id: quizId }
        });
        if (!existingQuiz) {
            res.status(404).json({ success: false, message: 'Quiz not found' });
            return;
        }
        if (existingQuiz.authorId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only update your own quizzes' });
            return;
        }
        const quiz = await database_1.prisma.quiz.update({
            where: { id: quizId },
            data: { title, description, duration, totalMarks, passingMarks, isActive },
            include: {
                course: {
                    select: { id: true, title: true, code: true }
                },
                author: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });
        res.json({ success: true, message: 'Quiz updated successfully', data: quiz });
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuiz = updateQuiz;
const deleteQuiz = async (req, res, next) => {
    try {
        const quizId = req.params.id;
        const teacherId = req.user.id;
        const existingQuiz = await database_1.prisma.quiz.findUnique({
            where: { id: quizId }
        });
        if (!existingQuiz) {
            res.status(404).json({ success: false, message: 'Quiz not found' });
            return;
        }
        if (existingQuiz.authorId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only delete your own quizzes' });
            return;
        }
        await database_1.prisma.quiz.update({
            where: { id: quizId },
            data: { isActive: false }
        });
        res.json({ success: true, message: 'Quiz deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteQuiz = deleteQuiz;
//# sourceMappingURL=quizzes.js.map