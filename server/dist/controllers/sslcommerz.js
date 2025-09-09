"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentIPN = exports.paymentCancel = exports.paymentFail = exports.paymentSuccess = exports.createPaymentSession = void 0;
const database_1 = require("../utils/database");
const sslcommerz_1 = require("../utils/sslcommerz");
const client_1 = require("@prisma/client");
const createPaymentSession = async (req, res) => {
    try {
        const { courseId, intakeId, amount } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        if (!courseId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Course ID and amount are required'
            });
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const course = await database_1.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                intakes: {
                    where: { isActive: true }
                }
            }
        });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        let expectedAmount = 0;
        let selectedIntake = null;
        if (course.intakes && course.intakes.length > 0) {
            if (intakeId) {
                selectedIntake = course.intakes.find(intake => intake.id === intakeId);
                if (!selectedIntake) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid intake selected'
                    });
                }
                expectedAmount = selectedIntake.amount || 0;
            }
            else {
                expectedAmount = Math.min(...course.intakes.map(intake => intake.amount || 0));
            }
        }
        else if (!course.isFree) {
            expectedAmount = course.price || 0;
        }
        else {
            expectedAmount = 0;
        }
        if (Math.abs(parseFloat(amount) - expectedAmount) > 0.01) {
            console.warn(`Amount manipulation detected: Expected ${expectedAmount}, Received ${amount} for course ${courseId}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid payment amount'
            });
        }
        let intake = null;
        if (intakeId) {
            intake = await database_1.prisma.intake.findUnique({
                where: { id: intakeId }
            });
        }
        const existingEnrollment = await database_1.prisma.enrollment.findFirst({
            where: {
                studentId: userId,
                courseId: courseId,
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
        if (expectedAmount === 0) {
            const enrollment = await database_1.prisma.enrollment.create({
                data: {
                    studentId: userId,
                    courseId: courseId,
                    intakeId: intakeId || null,
                    status: 'PENDING'
                }
            });
            const payment = await database_1.prisma.payment.create({
                data: {
                    userId: userId,
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
                data: {
                    sessionkey: null,
                    gatewayPageURL: null,
                    tran_id: payment.referenceId,
                    paymentId: payment.id,
                    enrollmentId: enrollment.id
                },
                message: 'Enrollment request submitted successfully! Your enrollment is pending admin approval.'
            });
        }
        else {
            const enrollment = await database_1.prisma.enrollment.create({
                data: {
                    studentId: userId,
                    courseId: courseId,
                    intakeId: intakeId || null,
                    status: 'PENDING'
                }
            });
            const payment = await database_1.prisma.payment.create({
                data: {
                    userId: userId,
                    enrollmentId: enrollment.id,
                    amount: expectedAmount,
                    currency: 'BDT',
                    method: 'SSLCOMMERZ',
                    status: 'PENDING',
                    referenceId: sslcommerz_1.sslCommerzService.generateTransactionId()
                }
            });
            const paymentData = {
                tran_id: payment.referenceId,
                total_amount: expectedAmount,
                currency: 'BDT',
                product_category: 'Education',
                product_name: course.title,
                product_profile: 'general',
                cus_name: `${user.firstName} ${user.lastName}`,
                cus_email: user.email,
                cus_add1: user.profile?.address || 'N/A',
                cus_city: user.profile?.city || 'N/A',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: user.profile?.phone || 'N/A',
                ship_name: `${user.firstName} ${user.lastName}`,
                ship_add1: user.profile?.address || 'N/A',
                ship_city: user.profile?.city || 'N/A',
                ship_postcode: '1000',
                ship_country: 'Bangladesh',
                multi_card_name: '',
                value_a: courseId,
                value_b: enrollment.id,
                value_c: userId,
                value_d: intakeId || ''
            };
            const paymentSession = await sslcommerz_1.sslCommerzService.createPaymentSession(paymentData);
            if (paymentSession.status === 'SUCCESS') {
                return res.json({
                    success: true,
                    data: {
                        sessionkey: paymentSession.sessionkey,
                        gatewayPageURL: paymentSession.gatewayPageURL,
                        tran_id: paymentSession.tran_id,
                        paymentId: payment.id,
                        enrollmentId: enrollment.id
                    },
                    message: 'Payment session created successfully'
                });
            }
            else {
                await database_1.prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'FAILED' }
                });
                return res.status(400).json({
                    success: false,
                    message: paymentSession.failedreason || 'Failed to create payment session'
                });
            }
        }
    }
    catch (error) {
        console.error('Error creating payment session:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.createPaymentSession = createPaymentSession;
const paymentSuccess = async (req, res) => {
    try {
        const { tran_id, val_id, amount, currency } = req.body;
        if (!tran_id || !val_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters'
            });
        }
        const payment = await database_1.prisma.payment.findUnique({
            where: { referenceId: tran_id },
            include: {
                enrollment: true
            }
        });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        const validationResult = await sslcommerz_1.sslCommerzService.validatePayment(tran_id, val_id, amount, currency);
        if (validationResult.status === 'SUCCESS') {
            await database_1.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'COMPLETED',
                    paidAt: new Date()
                }
            });
            await database_1.prisma.enrollment.update({
                where: { id: payment.enrollmentId },
                data: { status: 'ACTIVE' }
            });
            return res.json({
                success: true,
                message: 'Payment completed successfully'
            });
        }
        else {
            await database_1.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' }
            });
            return res.status(400).json({
                success: false,
                message: validationResult.failedreason || 'Payment validation failed'
            });
        }
    }
    catch (error) {
        console.error('Error processing payment success:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.paymentSuccess = paymentSuccess;
const paymentFail = async (req, res) => {
    try {
        const { tran_id, failedreason } = req.body;
        if (!tran_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing transaction ID'
            });
        }
        const payment = await database_1.prisma.payment.findUnique({
            where: { referenceId: tran_id }
        });
        if (payment) {
            await database_1.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' }
            });
            await database_1.prisma.enrollment.update({
                where: { id: payment.enrollmentId },
                data: { status: 'DROPPED' }
            });
        }
        return res.json({
            success: true,
            message: 'Payment failure recorded'
        });
    }
    catch (error) {
        console.error('Error processing payment failure:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.paymentFail = paymentFail;
const paymentCancel = async (req, res) => {
    try {
        const { tran_id } = req.body;
        if (!tran_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing transaction ID'
            });
        }
        const payment = await database_1.prisma.payment.findUnique({
            where: { referenceId: tran_id }
        });
        if (payment) {
            await database_1.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'CANCELLED' }
            });
            await database_1.prisma.enrollment.update({
                where: { id: payment.enrollmentId },
                data: { status: 'DROPPED' }
            });
        }
        return res.json({
            success: true,
            message: 'Payment cancellation recorded'
        });
    }
    catch (error) {
        console.error('Error processing payment cancellation:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.paymentCancel = paymentCancel;
const paymentIPN = async (req, res) => {
    try {
        const { tran_id, val_id, amount, currency, status } = req.body;
        if (!tran_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing transaction ID'
            });
        }
        const payment = await database_1.prisma.payment.findUnique({
            where: { referenceId: tran_id }
        });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        if (status === 'VALID' || status === 'VALIDATED') {
            const validationResult = await sslcommerz_1.sslCommerzService.validatePayment(tran_id, val_id, amount, currency);
            if (validationResult.status === 'SUCCESS') {
                await database_1.prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'COMPLETED',
                        paidAt: new Date()
                    }
                });
                await database_1.prisma.enrollment.update({
                    where: { id: payment.enrollmentId },
                    data: { status: 'ACTIVE' }
                });
            }
        }
        else if (status === 'FAILED' || status === 'CANCELLED') {
            await database_1.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' }
            });
            await database_1.prisma.enrollment.update({
                where: { id: payment.enrollmentId },
                data: { status: 'DROPPED' }
            });
        }
        return res.json({
            success: true,
            message: 'IPN processed successfully'
        });
    }
    catch (error) {
        console.error('Error processing IPN:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.paymentIPN = paymentIPN;
//# sourceMappingURL=sslcommerz.js.map