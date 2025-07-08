import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { sslCommerzService, PaymentRequest } from '../utils/sslcommerz';

// Create payment session for course enrollment
export const createPaymentSession = async (req: Request, res: Response) => {
  try {
    const { courseId, batchId, amount } = req.body;
    const userId = (req as any).user?.id;

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

    // Get user details
    const user = await prisma.user.findUnique({
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

    // Get course details with batches
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        batches: {
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

    // SECURITY: Validate amount on server side
    let expectedAmount = 0;
    let selectedIntake = null;

    if (course.batches && course.batches.length > 0) {
      // Course has batches - validate batch amount
      if (batchId) {
        selectedIntake = course.batches.find(batch => batch.id === batchId);
        if (!selectedIntake) {
          return res.status(400).json({
            success: false,
            message: 'Invalid batch selected'
          });
        }
        expectedAmount = selectedIntake.amount || 0;
      } else {
        // No specific batch selected, use minimum batch amount
        expectedAmount = Math.min(...course.batches.map(batch => batch.amount || 0));
      }
    } else if (!course.isFree) {
      // Course has no batches but is paid - use course price
      expectedAmount = course.price || 0;
    } else {
      // Free course
      expectedAmount = 0;
    }

    // SECURITY: Check if provided amount matches expected amount
    if (Math.abs(parseFloat(amount) - expectedAmount) > 0.01) {
      console.warn(`Amount manipulation detected: Expected ${expectedAmount}, Received ${amount} for course ${courseId}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    // Get batch details if provided
    let batch = null;
    if (batchId) {
      batch = await prisma.batch.findUnique({
        where: { id: batchId }
      });
    }

    // Check if user is already enrolled in this course
    const existingEnrollment = await prisma.enrollment.findFirst({
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

    // Check if this is a free course
    if (expectedAmount === 0) {
      // For free courses, create enrollment and payment directly
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: userId,
          courseId: courseId,
          batchId: batchId || null,
          status: 'ACTIVE' // Directly activate for free courses
        }
      });

      // Create completed payment record for free course
      const payment = await prisma.payment.create({
        data: {
          userId: userId,
          enrollmentId: enrollment.id,
          amount: 0,
          currency: 'BDT',
          method: 'OTHER',
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
        message: 'Free course enrolled successfully'
      });
    } else {
      // For paid courses, proceed with SSLCommerz
      // Create enrollment first (pending status)
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: userId,
          courseId: courseId,
          batchId: batchId || null,
          status: 'PENDING'
        }
      });

      // Create pending payment record
      const payment = await prisma.payment.create({
        data: {
          userId: userId,
          enrollmentId: enrollment.id,
          amount: expectedAmount, // Use validated amount
          currency: 'BDT',
          method: 'SSLCOMMERZ',
          status: 'PENDING',
          referenceId: sslCommerzService.generateTransactionId()
        }
      });

      // Prepare payment data for SSLCommerz
      const paymentData: PaymentRequest = {
        tran_id: payment.referenceId!,
        total_amount: expectedAmount, // Use validated amount
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
        value_d: batchId || ''
      };

      // Create payment session
      const paymentSession = await sslCommerzService.createPaymentSession(paymentData);

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
      } else {
        // Update payment status to failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' }
        });

        return res.status(400).json({
          success: false,
          message: paymentSession.failedreason || 'Failed to create payment session'
        });
      }
    }
  } catch (error) {
    console.error('Error creating payment session:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Handle payment success callback
export const paymentSuccess = async (req: Request, res: Response) => {
  try {
    const { tran_id, val_id, amount, currency } = req.body;

    if (!tran_id || !val_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Find payment by transaction ID
    const payment = await prisma.payment.findUnique({
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

    // Validate payment with SSLCommerz
    const validationResult = await sslCommerzService.validatePayment(
      tran_id,
      val_id,
      amount,
      currency
    );

    if (validationResult.status === 'SUCCESS') {
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date()
        }
      });

      // Update enrollment status
      await prisma.enrollment.update({
        where: { id: payment.enrollmentId },
        data: { status: 'ACTIVE' }
      });

      return res.json({
        success: true,
        message: 'Payment completed successfully'
      });
    } else {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      return res.status(400).json({
        success: false,
        message: validationResult.failedreason || 'Payment validation failed'
      });
    }
  } catch (error) {
    console.error('Error processing payment success:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Handle payment failure callback
export const paymentFail = async (req: Request, res: Response) => {
  try {
    const { tran_id, failedreason } = req.body;

    if (!tran_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction ID'
      });
    }

    // Find and update payment status
    const payment = await prisma.payment.findUnique({
      where: { referenceId: tran_id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      // Update enrollment status to dropped
      await prisma.enrollment.update({
        where: { id: payment.enrollmentId },
        data: { status: 'DROPPED' }
      });
    }

    return res.json({
      success: true,
      message: 'Payment failure recorded'
    });
  } catch (error) {
    console.error('Error processing payment failure:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Handle payment cancellation
export const paymentCancel = async (req: Request, res: Response) => {
  try {
    const { tran_id } = req.body;

    if (!tran_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction ID'
      });
    }

    // Find and update payment status
    const payment = await prisma.payment.findUnique({
      where: { referenceId: tran_id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'CANCELLED' }
      });

      // Update enrollment status to dropped
      await prisma.enrollment.update({
        where: { id: payment.enrollmentId },
        data: { status: 'DROPPED' }
      });
    }

    return res.json({
      success: true,
      message: 'Payment cancellation recorded'
    });
  } catch (error) {
    console.error('Error processing payment cancellation:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Handle IPN (Instant Payment Notification)
export const paymentIPN = async (req: Request, res: Response) => {
  try {
    const { tran_id, val_id, amount, currency, status } = req.body;

    if (!tran_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction ID'
      });
    }

    // Find payment
    const payment = await prisma.payment.findUnique({
      where: { referenceId: tran_id }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Process based on status
    if (status === 'VALID' || status === 'VALIDATED') {
      // Validate payment
      const validationResult = await sslCommerzService.validatePayment(
        tran_id,
        val_id,
        amount,
        currency
      );

      if (validationResult.status === 'SUCCESS') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date()
          }
        });

        await prisma.enrollment.update({
          where: { id: payment.enrollmentId },
          data: { status: 'ACTIVE' }
        });
      }
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      await prisma.enrollment.update({
        where: { id: payment.enrollmentId },
        data: { status: 'DROPPED' }
      });
    }

    return res.json({
      success: true,
      message: 'IPN processed successfully'
    });
  } catch (error) {
    console.error('Error processing IPN:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 