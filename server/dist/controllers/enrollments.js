"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEnrollment = exports.rejectEnrollment = exports.approveEnrollment = exports.getPendingEnrollments = exports.updateEnrollmentStatus = exports.createEnrollment = exports.getEnrollmentByStudentAndCourse = exports.getEnrollmentsByCourse = exports.getEnrollmentsByStudent = exports.getEnrollmentById = exports.getAllEnrollments = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
const getAllEnrollments = async (req, res, next) => {
    try {
        const enrollments = await exports.prisma.enrollment.findMany({
            include: {
                student: {
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
                        description: true,
                        credits: true,
                        price: true,
                        isFree: true,
                    },
                },
                intake: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        amount: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: enrollments,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllEnrollments = getAllEnrollments;
const getEnrollmentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const enrollment = await exports.prisma.enrollment.findUnique({
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
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        description: true,
                        credits: true,
                        price: true,
                        isFree: true,
                    },
                },
                intake: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        amount: true,
                    },
                },
            },
        });
        if (!enrollment) {
            res.status(404).json({
                success: false,
                message: 'Enrollment not found',
            });
            return;
        }
        res.json({
            success: true,
            data: enrollment,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEnrollmentById = getEnrollmentById;
const getEnrollmentsByStudent = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const enrollments = await exports.prisma.enrollment.findMany({
            where: { studentId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        description: true,
                        credits: true,
                        price: true,
                        isFree: true,
                        teacher: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                intake: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        amount: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: enrollments,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEnrollmentsByStudent = getEnrollmentsByStudent;
const getEnrollmentsByCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const enrollments = await exports.prisma.enrollment.findMany({
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
                intake: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        amount: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: enrollments,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEnrollmentsByCourse = getEnrollmentsByCourse;
const getEnrollmentByStudentAndCourse = async (req, res, next) => {
    try {
        const { studentId, courseId } = req.params;
        const enrollment = await exports.prisma.enrollment.findFirst({
            where: {
                studentId,
                courseId
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        description: true,
                        credits: true,
                        price: true,
                        isFree: true,
                        teacher: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                intake: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        amount: true,
                    },
                },
            },
        });
        if (!enrollment) {
            res.status(404).json({
                success: false,
                message: 'Enrollment not found',
            });
            return;
        }
        res.json({
            success: true,
            data: enrollment,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEnrollmentByStudentAndCourse = getEnrollmentByStudentAndCourse;
const createEnrollment = async (req, res, next) => {
    try {
        const { courseId, intakeId } = req.body;
        const studentId = req.user.id;
        if (!courseId) {
            res.status(400).json({
                success: false,
                message: 'CourseId is required',
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
        const course = await exports.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            res.status(404).json({
                success: false,
                message: 'Course not found',
            });
            return;
        }
        let finalIntakeId = intakeId;
        if (!intakeId) {
            const existingIntake = await exports.prisma.intake.findFirst({
                where: {
                    courseId,
                    isActive: true
                },
                orderBy: { startDate: 'desc' }
            });
            if (existingIntake) {
                finalIntakeId = existingIntake.id;
            }
            else if (course.isFree) {
                finalIntakeId = null;
            }
            else {
                finalIntakeId = null;
            }
        }
        else {
            const intake = await exports.prisma.intake.findUnique({
                where: { id: intakeId },
            });
            if (!intake) {
                res.status(404).json({
                    success: false,
                    message: 'Intake not found',
                });
                return;
            }
            if (intake.courseId !== courseId) {
                res.status(400).json({
                    success: false,
                    message: 'Intake does not belong to this course',
                });
                return;
            }
        }
        let existingEnrollment;
        if (finalIntakeId) {
            existingEnrollment = await exports.prisma.enrollment.findUnique({
                where: {
                    studentId_courseId_intakeId: {
                        studentId,
                        courseId,
                        intakeId: finalIntakeId,
                    },
                },
            });
        }
        else {
            existingEnrollment = await exports.prisma.enrollment.findFirst({
                where: {
                    studentId,
                    courseId,
                    intakeId: null,
                },
            });
        }
        if (existingEnrollment) {
            res.status(400).json({
                success: false,
                message: 'Student is already enrolled in this course',
            });
            return;
        }
        let intake = null;
        if (finalIntakeId) {
            intake = await exports.prisma.intake.findUnique({
                where: { id: finalIntakeId }
            });
        }
        const isFreeCourse = course.isFree || (intake && intake.amount === 0);
        const enrollmentData = {
            studentId,
            courseId,
            status: client_1.EnrollmentStatus.PENDING,
        };
        if (finalIntakeId) {
            enrollmentData.intakeId = finalIntakeId;
        }
        const enrollment = await exports.prisma.enrollment.create({
            data: enrollmentData,
            include: {
                student: {
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
                        description: true,
                        credits: true,
                        price: true,
                        isFree: true,
                    },
                },
                intake: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        amount: true,
                    },
                },
            },
        });
        if (isFreeCourse) {
            enrollment.course.isFree = true;
        }
        res.status(201).json({
            success: true,
            data: enrollment,
            message: 'Enrollment request submitted successfully! Your enrollment is pending admin approval. You will be notified once it is reviewed.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createEnrollment = createEnrollment;
const updateEnrollmentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const existingEnrollment = await exports.prisma.enrollment.findUnique({
            where: { id },
        });
        if (!existingEnrollment) {
            res.status(404).json({
                success: false,
                message: 'Enrollment not found',
            });
            return;
        }
        const enrollment = await exports.prisma.enrollment.update({
            where: { id },
            data: { status },
            include: {
                student: {
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
                        description: true,
                        credits: true,
                        price: true,
                        isFree: true,
                    },
                },
                intake: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        amount: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: enrollment,
            message: 'Enrollment status updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateEnrollmentStatus = updateEnrollmentStatus;
const getPendingEnrollments = async (req, res, next) => {
    try {
        const enrollments = await exports.prisma.enrollment.findMany({
            where: { status: client_1.EnrollmentStatus.PENDING },
            include: {
                student: {
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
                        description: true,
                        credits: true,
                        price: true,
                        isFree: true,
                        teacher: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                intake: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        amount: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: enrollments,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPendingEnrollments = getPendingEnrollments;
const approveEnrollment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        const existingEnrollment = await exports.prisma.enrollment.findUnique({
            where: { id },
            include: {
                student: true,
                course: true,
                intake: true,
            },
        });
        if (!existingEnrollment) {
            res.status(404).json({
                success: false,
                message: 'Enrollment not found',
            });
            return;
        }
        if (existingEnrollment.status !== client_1.EnrollmentStatus.PENDING) {
            res.status(400).json({
                success: false,
                message: 'Enrollment is not pending approval',
            });
            return;
        }
        const enrollment = await exports.prisma.enrollment.update({
            where: { id },
            data: {
                status: client_1.EnrollmentStatus.ACTIVE,
                approvedAt: new Date(),
                approvedBy: adminId,
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
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        description: true,
                        credits: true,
                        price: true,
                        isFree: true,
                    },
                },
                intake: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        amount: true,
                    },
                },
                approver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        const isFreeCourse = existingEnrollment.course.isFree || (existingEnrollment.intake && existingEnrollment.intake.amount === 0);
        if (isFreeCourse) {
            await exports.prisma.payment.create({
                data: {
                    userId: existingEnrollment.studentId,
                    enrollmentId: enrollment.id,
                    amount: 0,
                    currency: 'BDT',
                    method: client_1.PaymentMethod.CUSTOM,
                    status: 'COMPLETED',
                    referenceId: `FREE_APPROVED_${enrollment.id}`,
                    paidAt: new Date(),
                },
            });
        }
        res.json({
            success: true,
            data: enrollment,
            message: 'Enrollment approved successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.approveEnrollment = approveEnrollment;
const rejectEnrollment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        const adminId = req.user.id;
        const existingEnrollment = await exports.prisma.enrollment.findUnique({
            where: { id },
        });
        if (!existingEnrollment) {
            res.status(404).json({
                success: false,
                message: 'Enrollment not found',
            });
            return;
        }
        if (existingEnrollment.status !== client_1.EnrollmentStatus.PENDING) {
            res.status(400).json({
                success: false,
                message: 'Enrollment is not pending approval',
            });
            return;
        }
        const enrollment = await exports.prisma.enrollment.update({
            where: { id },
            data: {
                status: client_1.EnrollmentStatus.DROPPED,
                rejectedAt: new Date(),
                rejectionReason: rejectionReason || 'No reason provided',
                approvedBy: adminId,
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
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        description: true,
                        credits: true,
                        price: true,
                        isFree: true,
                    },
                },
                intake: {
                    select: {
                        id: true,
                        name: true,
                        startDate: true,
                        endDate: true,
                        amount: true,
                    },
                },
                approver: {
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
            data: enrollment,
            message: 'Enrollment rejected successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectEnrollment = rejectEnrollment;
const deleteEnrollment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingEnrollment = await exports.prisma.enrollment.findUnique({
            where: { id },
        });
        if (!existingEnrollment) {
            res.status(404).json({
                success: false,
                message: 'Enrollment not found',
            });
            return;
        }
        await exports.prisma.enrollment.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Enrollment deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteEnrollment = deleteEnrollment;
//# sourceMappingURL=enrollments.js.map