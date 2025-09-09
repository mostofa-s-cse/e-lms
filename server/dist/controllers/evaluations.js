"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvaluation = exports.updateEvaluation = exports.createEvaluation = exports.getEvaluationsByCourse = exports.getEvaluationById = exports.getEvaluationsByTeacher = exports.getAllEvaluations = exports.prisma = void 0;
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
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
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
const getEvaluationsByTeacher = async (req, res, next) => {
    try {
        const teacherId = req.user.id;
        const evaluations = await exports.prisma.evaluation.findMany({
            where: {
                evaluatorId: teacherId
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
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: evaluations,
            message: 'Teacher evaluations fetched successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEvaluationsByTeacher = getEvaluationsByTeacher;
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
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
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
        const evaluations = await exports.prisma.evaluation.findMany({
            where: { courseId },
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
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: evaluations,
            message: 'Course evaluations fetched successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEvaluationsByCourse = getEvaluationsByCourse;
const createEvaluation = async (req, res, next) => {
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
                score: score ? parseFloat(score) : undefined,
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
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
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