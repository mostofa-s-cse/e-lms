"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentQuizAttemptsByQuiz = exports.getStudentQuizAttempts = exports.deleteQuizAttempt = exports.createQuizAttempt = exports.getAllQuizAttempts = exports.getQuizAttemptById = exports.getQuizAttemptsByQuiz = void 0;
const database_1 = require("../utils/database");
const getQuizAttemptsByQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const attempts = await database_1.prisma.quizAttempt.findMany({
            where: { quizId },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        totalMarks: true,
                        passingMarks: true
                    }
                }
            },
            orderBy: { completedAt: 'desc' }
        });
        res.json({
            success: true,
            message: 'Quiz attempts fetched successfully',
            data: attempts
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuizAttemptsByQuiz = getQuizAttemptsByQuiz;
const getQuizAttemptById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attempt = await database_1.prisma.quizAttempt.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        totalMarks: true,
                        passingMarks: true,
                        duration: true
                    }
                },
                answers: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                question: true,
                                type: true,
                                options: true,
                                correctAnswer: true,
                                marks: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });
        if (!attempt) {
            res.status(404).json({ success: false, message: 'Quiz attempt not found' });
            return;
        }
        res.json({
            success: true,
            message: 'Quiz attempt fetched successfully',
            data: attempt
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuizAttemptById = getQuizAttemptById;
const getAllQuizAttempts = async (req, res, next) => {
    try {
        const attempts = await database_1.prisma.quizAttempt.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        totalMarks: true,
                        passingMarks: true
                    }
                },
                answers: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                question: true,
                                type: true,
                                options: true,
                                correctAnswer: true,
                                marks: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            },
            orderBy: { completedAt: 'desc' }
        });
        res.json({
            success: true,
            message: 'All quiz attempts fetched successfully',
            data: attempts
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllQuizAttempts = getAllQuizAttempts;
const createQuizAttempt = async (req, res, next) => {
    try {
        const { quizId, answers } = req.body;
        const studentId = req.user.id;
        console.log('Creating quiz attempt:', { quizId, studentId, answersCount: answers?.length });
        if (req.user.role !== 'STUDENT') {
            res.status(403).json({ success: false, message: 'Only students can take quizzes' });
            return;
        }
        if (!quizId || !answers || !Array.isArray(answers) || answers.length === 0) {
            res.status(400).json({ success: false, message: 'Invalid input: quizId and answers array are required' });
            return;
        }
        const quiz = await database_1.prisma.quiz.findUnique({
            where: { id: quizId }
        });
        if (!quiz || !quiz.isActive) {
            res.status(404).json({ success: false, message: 'Quiz not found or inactive' });
            return;
        }
        console.log('Quiz found:', { quizId: quiz.id, totalMarks: quiz.totalMarks, passingMarks: quiz.passingMarks });
        const existingAttempt = await database_1.prisma.quizAttempt.findFirst({
            where: {
                quizId,
                studentId
            }
        });
        if (existingAttempt) {
            console.log('Student has already attempted this quiz:', existingAttempt.id);
            res.status(400).json({
                success: false,
                message: 'You have already submitted this quiz. You cannot submit it again.'
            });
            return;
        }
        let totalScore = 0;
        const questions = await database_1.prisma.question.findMany({
            where: { quizId, isActive: true }
        });
        console.log('Questions found:', questions.length);
        if (questions.length === 0) {
            res.status(400).json({ success: false, message: 'No questions found for this quiz' });
            return;
        }
        const quizAnswers = [];
        for (const answer of answers) {
            const question = questions.find(q => q.id === answer.questionId);
            if (question) {
                const isCorrect = question.correctAnswer === answer.answer;
                const marksEarned = isCorrect ? question.marks : 0;
                totalScore += marksEarned;
                quizAnswers.push({
                    answer: answer.answer,
                    isCorrect,
                    marksEarned,
                    questionId: answer.questionId
                });
            }
        }
        const isPassed = totalScore >= quiz.passingMarks;
        console.log('Quiz attempt calculation:', { totalScore, totalMarks: quiz.totalMarks, isPassed });
        const attempt = await database_1.prisma.quizAttempt.create({
            data: {
                studentId,
                quizId,
                score: totalScore,
                totalMarks: quiz.totalMarks,
                isPassed,
                startedAt: new Date(),
                completedAt: new Date(),
                answers: {
                    create: quizAnswers
                }
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        totalMarks: true,
                        passingMarks: true
                    }
                }
            }
        });
        console.log('Quiz attempt created successfully:', attempt.id);
        res.status(201).json({
            success: true,
            message: 'Quiz attempt submitted successfully',
            data: attempt
        });
    }
    catch (error) {
        console.error('Error creating quiz attempt:', error);
        next(error);
    }
};
exports.createQuizAttempt = createQuizAttempt;
const deleteQuizAttempt = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const attempt = await database_1.prisma.quizAttempt.findUnique({
            where: { id }
        });
        if (!attempt) {
            res.status(404).json({ success: false, message: 'Quiz attempt not found' });
            return;
        }
        await database_1.prisma.quizAttempt.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Quiz attempt deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteQuizAttempt = deleteQuizAttempt;
const getStudentQuizAttempts = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        if (req.user.role !== 'STUDENT') {
            res.status(403).json({ success: false, message: 'Only students can access their quiz attempts' });
            return;
        }
        const attempts = await database_1.prisma.quizAttempt.findMany({
            where: { studentId },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        totalMarks: true,
                        passingMarks: true,
                        duration: true,
                        isActive: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                                code: true
                            }
                        }
                    }
                },
                answers: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                question: true,
                                type: true,
                                options: true,
                                correctAnswer: true,
                                marks: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            message: 'Student quiz attempts fetched successfully',
            data: attempts
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStudentQuizAttempts = getStudentQuizAttempts;
const getStudentQuizAttemptsByQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id;
        if (req.user.role !== 'STUDENT') {
            res.status(403).json({ success: false, message: 'Only students can access their quiz attempts' });
            return;
        }
        const attempts = await database_1.prisma.quizAttempt.findMany({
            where: {
                quizId,
                studentId
            },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        totalMarks: true,
                        passingMarks: true,
                        duration: true,
                        isActive: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                                code: true
                            }
                        }
                    }
                },
                answers: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                question: true,
                                type: true,
                                options: true,
                                correctAnswer: true,
                                marks: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            message: 'Student quiz attempts for specific quiz fetched successfully',
            data: attempts
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStudentQuizAttemptsByQuiz = getStudentQuizAttemptsByQuiz;
//# sourceMappingURL=quizAttempts.js.map