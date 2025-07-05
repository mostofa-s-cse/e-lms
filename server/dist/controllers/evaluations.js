"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvaluation = exports.updateEvaluation = exports.createEvaluation = exports.getEvaluationsByCourse = exports.getEvaluationById = exports.getAllEvaluations = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
const getAllEvaluations = async (req, res, next) => {
    try {
        const evaluations = await exports.prisma.evaluation.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                evaluator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: evaluations,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllEvaluations = getAllEvaluations;
const getEvaluationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const evaluation = await exports.prisma.evaluation.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                evaluator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        if (!evaluation) {
            res.status(404).json({
                success: false,
                message: 'Evaluation not found',
            });
            return;
        }
        res.json({
            success: true,
            data: evaluation,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEvaluationById = getEvaluationById;
const getEvaluationsByCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        res.json({
            success: true,
            data: [],
            message: 'Course-based evaluations not implemented yet',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEvaluationsByCourse = getEvaluationsByCourse;
const createEvaluation = async (req, res, next) => {
    try {
        const { title, description, type, score, maxScore, feedback, studentId } = req.body;
        if (!title || !studentId || !type || !maxScore) {
            res.status(400).json({
                success: false,
                message: 'Title, studentId, type, and maxScore are required',
            });
            return;
        }
        const student = await exports.prisma.user.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            res.status(404).json({
                success: false,
                message: 'Student not found',
            });
            return;
        }
        const evaluation = await exports.prisma.evaluation.create({
            data: {
                title,
                description,
                type,
                score: score ? parseFloat(score) : null,
                maxScore: parseFloat(maxScore),
                feedback,
                studentId,
                evaluatorId: req.user.id,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                evaluator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            data: evaluation,
            message: 'Evaluation created successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createEvaluation = createEvaluation;
const updateEvaluation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, type, score, maxScore, feedback } = req.body;
        const existingEvaluation = await exports.prisma.evaluation.findUnique({
            where: { id },
        });
        if (!existingEvaluation) {
            res.status(404).json({
                success: false,
                message: 'Evaluation not found',
            });
            return;
        }
        const evaluation = await exports.prisma.evaluation.update({
            where: { id },
            data: {
                title,
                description,
                type,
                score: score ? parseFloat(score) : null,
                maxScore: maxScore ? parseFloat(maxScore) : undefined,
                feedback,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                evaluator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: evaluation,
            message: 'Evaluation updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateEvaluation = updateEvaluation;
const deleteEvaluation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingEvaluation = await exports.prisma.evaluation.findUnique({
            where: { id },
        });
        if (!existingEvaluation) {
            res.status(404).json({
                success: false,
                message: 'Evaluation not found',
            });
            return;
        }
        await exports.prisma.evaluation.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Evaluation deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteEvaluation = deleteEvaluation;
//# sourceMappingURL=evaluations.js.map