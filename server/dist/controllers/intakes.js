"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntakeEnrollments = exports.deleteIntake = exports.updateIntake = exports.createIntake = exports.getIntakeById = exports.getAllIntakes = void 0;
const database_1 = require("../utils/database");
const getAllIntakes = async (req, res, next) => {
    try {
        const intakes = await database_1.prisma.intake.findMany({
            where: { isActive: true },
            include: {
                course: {
                    select: { id: true, title: true, code: true }
                },
                _count: {
                    select: { enrollments: true }
                }
            },
            orderBy: { startDate: 'desc' }
        });
        res.json({ success: true, message: 'Intakes fetched successfully', data: intakes });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllIntakes = getAllIntakes;
const getIntakeById = async (req, res, next) => {
    try {
        const intake = await database_1.prisma.intake.findUnique({
            where: { id: req.params.id },
            include: {
                course: {
                    select: { id: true, title: true, code: true, teacher: { select: { firstName: true, lastName: true } } }
                },
                enrollments: {
                    include: {
                        student: {
                            select: { id: true, firstName: true, lastName: true, email: true }
                        }
                    }
                },
                _count: {
                    select: { enrollments: true }
                }
            }
        });
        if (!intake) {
            res.status(404).json({ success: false, message: 'Intake not found' });
            return;
        }
        res.json({ success: true, message: 'Intake fetched successfully', data: intake });
    }
    catch (error) {
        next(error);
    }
};
exports.getIntakeById = getIntakeById;
const createIntake = async (req, res, next) => {
    try {
        const { name, startDate, endDate, courseId, amount } = req.body;
        const teacherId = req.user.id;
        const course = await database_1.prisma.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }
        if (course.teacherId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only create intakes for your own courses' });
            return;
        }
        const intake = await database_1.prisma.intake.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                courseId,
                amount: amount ? parseFloat(amount) : 0.0
            },
            include: {
                course: {
                    select: { id: true, title: true, code: true }
                }
            }
        });
        res.status(201).json({ success: true, message: 'Intake created successfully', data: intake });
    }
    catch (error) {
        next(error);
    }
};
exports.createIntake = createIntake;
const updateIntake = async (req, res, next) => {
    try {
        const { name, startDate, endDate, isActive, amount } = req.body;
        const intakeId = req.params.id;
        const teacherId = req.user.id;
        const existingIntake = await database_1.prisma.intake.findUnique({
            where: { id: intakeId },
            include: {
                course: true
            }
        });
        if (!existingIntake) {
            res.status(404).json({ success: false, message: 'Intake not found' });
            return;
        }
        if (existingIntake.course.teacherId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only update intakes for your own courses' });
            return;
        }
        const intake = await database_1.prisma.intake.update({
            where: { id: intakeId },
            data: {
                name,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                isActive,
                amount: amount !== undefined ? parseFloat(amount) : undefined
            },
            include: {
                course: {
                    select: { id: true, title: true, code: true }
                }
            }
        });
        res.json({ success: true, message: 'Intake updated successfully', data: intake });
    }
    catch (error) {
        next(error);
    }
};
exports.updateIntake = updateIntake;
const deleteIntake = async (req, res, next) => {
    try {
        const intakeId = req.params.id;
        const teacherId = req.user.id;
        const existingIntake = await database_1.prisma.intake.findUnique({
            where: { id: intakeId },
            include: {
                course: true
            }
        });
        if (!existingIntake) {
            res.status(404).json({ success: false, message: 'Intake not found' });
            return;
        }
        if (existingIntake.course.teacherId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only delete intakes for your own courses' });
            return;
        }
        await database_1.prisma.intake.update({
            where: { id: intakeId },
            data: { isActive: false }
        });
        res.json({ success: true, message: 'Intake deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteIntake = deleteIntake;
const getIntakeEnrollments = async (req, res, next) => {
    try {
        const intakeId = req.params.id;
        const enrollments = await database_1.prisma.enrollment.findMany({
            where: { intakeId },
            include: {
                student: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                course: {
                    select: { id: true, title: true, code: true }
                }
            },
            orderBy: { enrolledAt: 'desc' }
        });
        res.json({ success: true, message: 'Intake enrollments fetched successfully', data: enrollments });
    }
    catch (error) {
        next(error);
    }
};
exports.getIntakeEnrollments = getIntakeEnrollments;
//# sourceMappingURL=intakes.js.map