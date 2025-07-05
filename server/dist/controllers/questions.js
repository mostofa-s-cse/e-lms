"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestion = exports.updateQuestion = exports.createQuestion = exports.getQuestionsByQuiz = exports.getQuestionById = exports.getAllQuestions = void 0;
const database_1 = require("../utils/database");
const getAllQuestions = async (req, res, next) => {
    try {
        const questions = await database_1.prisma.question.findMany({
            where: { isActive: true },
            include: {
                quiz: {
                    select: { id: true, title: true }
                },
                author: {
                    select: { id: true, firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const mappedQuestions = questions.map(q => ({
            id: q.id,
            question: q.question,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: q.marks,
            isActive: q.isActive,
            quizId: q.quizId,
            quiz: q.quiz,
            author: q.author,
            createdAt: q.createdAt,
            updatedAt: q.updatedAt
        }));
        res.json({ success: true, message: 'Questions fetched successfully', data: mappedQuestions });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllQuestions = getAllQuestions;
const getQuestionById = async (req, res, next) => {
    try {
        const question = await database_1.prisma.question.findUnique({
            where: { id: req.params.id },
            include: {
                quiz: {
                    select: { id: true, title: true }
                },
                author: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });
        if (!question) {
            res.status(404).json({ success: false, message: 'Question not found' });
            return;
        }
        const mappedQuestion = {
            id: question.id,
            question: question.question,
            type: question.type,
            options: question.options,
            correctAnswer: question.correctAnswer,
            marks: question.marks,
            isActive: question.isActive,
            quizId: question.quizId,
            quiz: question.quiz,
            author: question.author,
            createdAt: question.createdAt,
            updatedAt: question.updatedAt
        };
        res.json({ success: true, message: 'Question fetched successfully', data: mappedQuestion });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuestionById = getQuestionById;
const getQuestionsByQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const questions = await database_1.prisma.question.findMany({
            where: {
                quizId,
                isActive: true
            },
            include: {
                quiz: {
                    select: { id: true, title: true }
                },
                author: {
                    select: { id: true, firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const mappedQuestions = questions.map(q => ({
            id: q.id,
            question: q.question,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: q.marks,
            isActive: q.isActive,
            quizId: q.quizId,
            quiz: q.quiz,
            author: q.author,
            createdAt: q.createdAt,
            updatedAt: q.updatedAt
        }));
        res.json({ success: true, message: 'Questions fetched successfully', data: mappedQuestions });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuestionsByQuiz = getQuestionsByQuiz;
const createQuestion = async (req, res, next) => {
    try {
        const { title, content, type, options, correctAnswer, points, quizId } = req.body;
        const teacherId = req.user.id;
        const question = title || content;
        const marks = points || 1;
        const quiz = await database_1.prisma.quiz.findUnique({
            where: { id: quizId }
        });
        if (!quiz) {
            res.status(404).json({ success: false, message: 'Quiz not found' });
            return;
        }
        if (quiz.authorId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only create questions for your own quizzes' });
            return;
        }
        const questionData = await database_1.prisma.question.create({
            data: {
                question,
                type,
                options: options || [],
                correctAnswer,
                marks,
                quizId,
                authorId: teacherId
            },
            include: {
                quiz: {
                    select: { id: true, title: true }
                },
                author: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });
        const mappedQuestion = {
            id: questionData.id,
            title: questionData.question,
            content: questionData.question,
            type: questionData.type,
            options: questionData.options,
            correctAnswer: questionData.correctAnswer,
            points: questionData.marks,
            quizId: questionData.quizId,
            quiz: questionData.quiz,
            teacher: questionData.author,
            createdAt: questionData.createdAt
        };
        res.status(201).json({ success: true, message: 'Question created successfully', data: mappedQuestion });
    }
    catch (error) {
        next(error);
    }
};
exports.createQuestion = createQuestion;
const updateQuestion = async (req, res, next) => {
    try {
        const { title, content, type, options, correctAnswer, points, isActive } = req.body;
        const questionId = req.params.id;
        const teacherId = req.user.id;
        const question = title || content;
        const marks = points;
        const existingQuestion = await database_1.prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!existingQuestion) {
            res.status(404).json({ success: false, message: 'Question not found' });
            return;
        }
        if (existingQuestion.authorId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only update your own questions' });
            return;
        }
        const questionData = await database_1.prisma.question.update({
            where: { id: questionId },
            data: { question, type, options, correctAnswer, marks, isActive },
            include: {
                quiz: {
                    select: { id: true, title: true }
                },
                author: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });
        const mappedQuestion = {
            id: questionData.id,
            title: questionData.question,
            content: questionData.question,
            type: questionData.type,
            options: questionData.options,
            correctAnswer: questionData.correctAnswer,
            points: questionData.marks,
            quizId: questionData.quizId,
            quiz: questionData.quiz,
            teacher: questionData.author,
            createdAt: questionData.createdAt
        };
        res.json({ success: true, message: 'Question updated successfully', data: mappedQuestion });
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res, next) => {
    try {
        const questionId = req.params.id;
        const teacherId = req.user.id;
        const existingQuestion = await database_1.prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!existingQuestion) {
            res.status(404).json({ success: false, message: 'Question not found' });
            return;
        }
        if (existingQuestion.authorId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only delete your own questions' });
            return;
        }
        await database_1.prisma.question.update({
            where: { id: questionId },
            data: { isActive: false }
        });
        res.json({ success: true, message: 'Question deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteQuestion = deleteQuestion;
//# sourceMappingURL=questions.js.map