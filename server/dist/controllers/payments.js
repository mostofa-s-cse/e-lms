"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFreeEnrollment = exports.createCartPayment = exports.createCustomPayment = exports.markPaymentCompleted = exports.deletePayment = exports.updatePayment = exports.createPayment = exports.getPaymentsByEnrollment = exports.getPaymentsByUser = exports.getPaymentById = exports.getAllPayments = void 0;
const database_1 = require("../utils/database");
const client_1 = require("@prisma/client");
const getAllPayments = async (req, res) => {
    try {
        const payments = await database_1.prisma.payment.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                enrollment: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                code: true,
                            },
                        },
                        intake: {
                            select: {
                                id: true,
                                name: true,
                                amount: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json({
            success: true,
            data: payments,
        });
    }
    catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payments',
        });
    }
};
exports.getAllPayments = getAllPayments;
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await database_1.prisma.payment.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                enrollment: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                code: true,
                            },
                        },
                        intake: {
                            select: {
                                id: true,
                                name: true,
                                amount: true,
                            },
                        },
                    },
                },
            },
        });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }
        return res.json({
            success: true,
            data: payment,
        });
    }
    catch (error) {
        console.error('Error fetching payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch payment',
        });
    }
};
exports.getPaymentById = getPaymentById;
const getPaymentsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const payments = await database_1.prisma.payment.findMany({
            where: { userId },
            include: {
                enrollment: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                code: true,
                            },
                        },
                        intake: {
                            select: {
                                id: true,
                                name: true,
                                amount: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return res.json({
            success: true,
            data: payments,
        });
    }
    catch (error) {
        console.error('Error fetching user payments:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user payments',
        });
    }
};
exports.getPaymentsByUser = getPaymentsByUser;
const getPaymentsByEnrollment = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const payments = await database_1.prisma.payment.findMany({
            where: { enrollmentId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return res.json({
            success: true,
            data: payments,
        });
    }
    catch (error) {
        console.error('Error fetching enrollment payments:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch enrollment payments',
        });
    }
};
exports.getPaymentsByEnrollment = getPaymentsByEnrollment;
const createPayment = async (req, res) => {
    try {
        const { userId, enrollmentId, amount, currency, method, referenceId } = req.body;
        if (!userId || !enrollmentId || !amount || !method) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        const enrollment = await database_1.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        intakes: true
                    }
                },
                intake: true
            }
        });
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found',
            });
        }
        let expectedAmount = 0;
        if (enrollment.intake) {
            expectedAmount = enrollment.intake.amount || 0;
        }
        else if (!enrollment.course.isFree) {
            expectedAmount = enrollment.course.price || 0;
        }
        if (Math.abs(parseFloat(amount) - expectedAmount) > 0.01) {
            console.warn(`Payment amount manipulation detected: Expected ${expectedAmount}, Received ${amount} for enrollment ${enrollmentId}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid payment amount',
            });
        }
        const existingPayment = await database_1.prisma.payment.findFirst({
            where: { enrollmentId }
        });
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'Payment already exists for this enrollment',
            });
        }
        const payment = await database_1.prisma.payment.create({
            data: {
                userId,
                enrollmentId,
                amount: expectedAmount,
                currency: currency || 'BDT',
                method,
                referenceId,
                status: 'PENDING',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                enrollment: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                code: true,
                            },
                        },
                        intake: {
                            select: {
                                id: true,
                                name: true,
                                amount: true,
                            },
                        },
                    },
                },
            },
        });
        return res.status(201).json({
            success: true,
            data: payment,
            message: 'Payment created successfully',
        });
    }
    catch (error) {
        console.error('Error creating payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create payment',
        });
    }
};
exports.createPayment = createPayment;
const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, currency, status, method, referenceId, paidAt } = req.body;
        const existingPayment = await database_1.prisma.payment.findUnique({
            where: { id },
        });
        if (!existingPayment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }
        const payment = await database_1.prisma.payment.update({
            where: { id },
            data: {
                ...(amount && { amount: parseFloat(amount) }),
                ...(currency && { currency }),
                ...(status && { status }),
                ...(method && { method }),
                ...(referenceId && { referenceId }),
                ...(paidAt && { paidAt: new Date(paidAt) }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                enrollment: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                code: true,
                            },
                        },
                        intake: {
                            select: {
                                id: true,
                                name: true,
                                amount: true,
                            },
                        },
                    },
                },
            },
        });
        return res.json({
            success: true,
            data: payment,
            message: 'Payment updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update payment',
        });
    }
};
exports.updatePayment = updatePayment;
const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const existingPayment = await database_1.prisma.payment.findUnique({
            where: { id },
        });
        if (!existingPayment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }
        await database_1.prisma.payment.delete({
            where: { id },
        });
        return res.json({
            success: true,
            message: 'Payment deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete payment',
        });
    }
};
exports.deletePayment = deletePayment;
const markPaymentCompleted = async (req, res) => {
    try {
        const { id } = req.params;
        const { referenceId } = req.body;
        const existingPayment = await database_1.prisma.payment.findUnique({
            where: { id },
        });
        if (!existingPayment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }
        const payment = await database_1.prisma.payment.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                paidAt: new Date(),
                ...(referenceId && { referenceId }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                enrollment: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                code: true,
                            },
                        },
                        intake: {
                            select: {
                                id: true,
                                name: true,
                                amount: true,
                            },
                        },
                    },
                },
            },
        });
        return res.json({
            success: true,
            data: payment,
            message: 'Payment marked as completed',
        });
    }
    catch (error) {
        console.error('Error marking payment as completed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to mark payment as completed',
        });
    }
};
exports.markPaymentCompleted = markPaymentCompleted;
const createCustomPayment = async (req, res) => {
    try {
        const { courseId, intakeId: rawIntakeId, amount, paymentMethod, paymentDetails, testStatus, } = req.body;
        const userId = req.user?.id;
        const intakeId = rawIntakeId &&
            rawIntakeId !== 'null' &&
            rawIntakeId !== 'undefined' &&
            rawIntakeId !== 'No Intake' &&
            typeof rawIntakeId === 'string' &&
            rawIntakeId.trim() !== ''
            ? rawIntakeId.trim()
            : null;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        if (!courseId || !amount) {
            return res.status(400).json({ success: false, message: 'Course ID and amount are required' });
        }
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const course = await database_1.prisma.course.findUnique({
            where: { id: courseId },
            include: { intakes: { where: { isActive: true } } },
        });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        if (intakeId) {
            const intakeExists = course.intakes.some((i) => i.id === intakeId);
            if (!intakeExists) {
                return res.status(400).json({ success: false, message: 'Invalid intake selected' });
            }
        }
        const existingEnrollment = await database_1.prisma.enrollment.findFirst({
            where: {
                studentId: userId,
                courseId,
                ...(intakeId ? { intakeId } : { intakeId: null }),
                status: { in: ['ACTIVE', 'PENDING', 'COMPLETED'] },
            },
        });
        if (existingEnrollment) {
            return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
        }
        const enrollmentData = {
            studentId: userId,
            courseId,
            status: 'PENDING',
        };
        if (intakeId !== null) {
            enrollmentData.intakeId = intakeId;
        }
        const enrollment = await database_1.prisma.enrollment.create({ data: enrollmentData });
        let paymentStatus = 'COMPLETED';
        let paidAt = new Date();
        if (testStatus) {
            switch (testStatus) {
                case 'FAILED':
                    paymentStatus = 'FAILED';
                    paidAt = null;
                    break;
                case 'CANCELLED':
                    paymentStatus = 'CANCELLED';
                    paidAt = null;
                    break;
                default:
                    paymentStatus = 'COMPLETED';
                    paidAt = new Date();
            }
        }
        const payment = await database_1.prisma.payment.create({
            data: {
                userId,
                enrollmentId: enrollment.id,
                amount: parseFloat(amount),
                currency: 'BDT',
                method: paymentMethod,
                status: paymentStatus,
                referenceId: `FREE_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                paidAt,
            },
        });
        if (paymentStatus !== 'COMPLETED') {
            await database_1.prisma.enrollment.delete({ where: { id: enrollment.id } });
            return res.json({
                success: false,
                data: { paymentId: payment.id, status: paymentStatus },
                message: paymentStatus === 'FAILED' ? 'Payment failed' : 'Payment cancelled',
            });
        }
        return res.json({
            success: true,
            data: {
                paymentId: payment.id,
                enrollmentId: enrollment.id,
                amount: parseFloat(amount),
            },
            message: 'Payment processed successfully! Your enrollment is pending admin approval.',
        });
    }
    catch (error) {
        console.error('Error creating custom payment:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.createCustomPayment = createCustomPayment;
const createCartPayment = async (req, res) => {
    try {
        const { items, total, userId, userEmail, userName, paymentMethod, paymentDetails, testStatus, } = req.body;
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }
        if (currentUserId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access',
            });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items in cart',
            });
        }
        const calculatedTotal = items.reduce((sum, item) => sum + item.amount, 0);
        if (Math.abs(calculatedTotal - total) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Invalid total amount',
            });
        }
        let paymentStatus = 'COMPLETED';
        let paidAt = new Date();
        if (testStatus) {
            switch (testStatus) {
                case 'SUCCESS':
                    paymentStatus = 'COMPLETED';
                    paidAt = new Date();
                    break;
                case 'FAILED':
                    paymentStatus = 'FAILED';
                    paidAt = null;
                    break;
                case 'CANCELLED':
                    paymentStatus = 'CANCELLED';
                    paidAt = null;
                    break;
                default:
                    paymentStatus = 'COMPLETED';
                    paidAt = new Date();
            }
        }
        const enrollments = [];
        const payments = [];
        for (const item of items) {
            const intakeId = item.intakeId && typeof item.intakeId === 'string' && item.intakeId.trim() !== ''
                ? item.intakeId.trim()
                : null;
            const existingEnrollment = await database_1.prisma.enrollment.findFirst({
                where: {
                    studentId: userId,
                    courseId: item.courseId,
                    intakeId,
                    status: {
                        in: ['ACTIVE', 'PENDING', 'COMPLETED'],
                    },
                },
            });
            if (existingEnrollment) {
                continue;
            }
            const course = await database_1.prisma.course.findUnique({
                where: { id: item.courseId }
            });
            let intake = null;
            if (intakeId) {
                intake = await database_1.prisma.intake.findUnique({
                    where: { id: intakeId }
                });
            }
            const isFreeCourse = course?.isFree || (intake && intake.amount === 0);
            const enrollment = await database_1.prisma.enrollment.create({
                data: {
                    studentId: userId,
                    courseId: item.courseId,
                    ...(intakeId ? { intakeId } : {}),
                    status: 'PENDING',
                },
            });
            enrollments.push(enrollment);
            const payment = await database_1.prisma.payment.create({
                data: {
                    userId,
                    enrollmentId: enrollment.id,
                    amount: item.amount,
                    currency: 'BDT',
                    method: paymentMethod,
                    status: paymentStatus,
                    referenceId: `FREE_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    paidAt,
                },
            });
            payments.push(payment);
        }
        if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
            await Promise.all(enrollments.map((enrollment) => database_1.prisma.enrollment.delete({ where: { id: enrollment.id } })));
            return res.json({
                success: false,
                data: {
                    payments: payments.map((p) => p.id),
                    status: paymentStatus,
                },
                message: paymentStatus === 'FAILED' ? 'Payment processing failed' : 'Payment was cancelled',
            });
        }
        return res.json({
            success: true,
            data: {
                enrollments: enrollments.map((e) => e.id),
                payments: payments.map((p) => p.id),
                total: calculatedTotal,
            },
            message: 'Cart payment processed successfully! Your enrollments are pending admin approval.',
        });
    }
    catch (error) {
        console.error('Error creating cart payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.createCartPayment = createCartPayment;
const createFreeEnrollment = async (req, res) => {
    try {
        const { courseId } = req.body;
        let intakeId = req.body.intakeId;
        const userId = req.user?.id;
        if (!intakeId || intakeId === 'null' || intakeId === 'undefined' || intakeId === 'No Intake' || intakeId.trim() === '') {
            intakeId = null;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }
        const existingEnrollment = await database_1.prisma.enrollment.findFirst({
            where: {
                studentId: userId,
                courseId,
                intakeId,
                status: {
                    in: ['ACTIVE', 'PENDING', 'COMPLETED']
                }
            }
        });
        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this course'
            });
        }
        const course = await database_1.prisma.course.findUnique({
            where: { id: courseId }
        });
        let intake = null;
        if (intakeId) {
            intake = await database_1.prisma.intake.findUnique({
                where: { id: intakeId }
            });
        }
        const isFreeCourse = course?.isFree || (intake && intake.amount === 0);
        const enrollment = await database_1.prisma.enrollment.create({
            data: {
                studentId: userId,
                courseId,
                status: 'PENDING',
                ...(intakeId ? { intakeId } : {})
            }
        });
        const payment = await database_1.prisma.payment.create({
            data: {
                userId,
                enrollmentId: enrollment.id,
                amount: 0,
                currency: 'BDT',
                method: client_1.PaymentMethod.CUSTOM,
                status: 'COMPLETED',
                referenceId: `FREE_${enrollment.id}`,
                paidAt: new Date()
            }
        });
        return res.json({
            success: true,
            message: 'Free course enrolled successfully',
            data: {
                enrollmentId: enrollment.id,
                paymentId: payment.id
            }
        });
    }
    catch (error) {
        console.error('Error creating free enrollment:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.createFreeEnrollment = createFreeEnrollment;
//# sourceMappingURL=payments.js.map