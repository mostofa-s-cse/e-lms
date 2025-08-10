import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { EnrollmentStatus, PaymentMethod } from '@prisma/client';

// Get all payments
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
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
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
    });
  }
};

// Get payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
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
  } catch (error) {
    console.error('Error fetching payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
    });
  }
};

// Get payments by user ID
export const getPaymentsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const payments = await prisma.payment.findMany({
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
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user payments',
    });
  }
};

// Get payments by enrollment ID
export const getPaymentsByEnrollment = async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;

    const payments = await prisma.payment.findMany({
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
  } catch (error) {
    console.error('Error fetching enrollment payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment payments',
    });
  }
};

// Create new payment
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { userId, enrollmentId, amount, currency, method, referenceId } = req.body;

    // Validate required fields
    if (!userId || !enrollmentId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if enrollment exists and get course details
    const enrollment = await prisma.enrollment.findUnique({
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

    // SECURITY: Validate payment amount against course/intake pricing
    let expectedAmount = 0;
    if (enrollment.intake) {
      expectedAmount = enrollment.intake.amount || 0;
    } else if (!enrollment.course.isFree) {
      expectedAmount = enrollment.course.price || 0;
    }

    // Check if provided amount matches expected amount
    if (Math.abs(parseFloat(amount) - expectedAmount) > 0.01) {
      console.warn(`Payment amount manipulation detected: Expected ${expectedAmount}, Received ${amount} for enrollment ${enrollmentId}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount',
      });
    }

    // Check if payment already exists for this enrollment
    const existingPayment = await prisma.payment.findFirst({
      where: { enrollmentId }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this enrollment',
      });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        userId,
        enrollmentId,
        amount: expectedAmount, // Use validated amount
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
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment',
    });
  }
};

// Update payment
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, currency, status, method, referenceId, paidAt } = req.body;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Update payment
    const payment = await prisma.payment.update({
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
  } catch (error) {
    console.error('Error updating payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment',
    });
  }
};

// Delete payment
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Delete payment
    await prisma.payment.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Payment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete payment',
    });
  }
};

// Mark payment as completed
export const markPaymentCompleted = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { referenceId } = req.body;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Update payment status
    const payment = await prisma.payment.update({
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
  } catch (error) {
    console.error('Error marking payment as completed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark payment as completed',
    });
  }
};

// Create custom payment for single course
export const createCustomPayment = async (req: Request, res: Response) => {
  try {
    const {
      courseId,
      intakeId: rawIntakeId,
      amount,
      paymentMethod,
      paymentDetails,
      testStatus,
    } = req.body;

    const userId = (req as any).user?.id;

    // Normalize intakeId strictly to either valid string or null
    const intakeId =
      rawIntakeId &&
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

    // Fetch user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch course with active intakes
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { intakes: { where: { isActive: true } } },
    });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Validate intakeId if provided
    if (intakeId) {
      const intakeExists = course.intakes.some((i) => i.id === intakeId);
      if (!intakeExists) {
        return res.status(400).json({ success: false, message: 'Invalid intake selected' });
      }
    }

    // OPTIONAL: Validate amount if needed (your existing validation here)

    // Check existing enrollment for user + course + intake (or null)
    const existingEnrollment = await prisma.enrollment.findFirst({
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

    // Prepare enrollment data
    const enrollmentData: any = {
      studentId: userId,
      courseId,
      status: 'ACTIVE',
    };
    if (intakeId !== null) {
      enrollmentData.intakeId = intakeId;
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({ data: enrollmentData });

    // Determine payment status and paidAt date
    let paymentStatus: 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'COMPLETED';
    let paidAt: Date | null = new Date();

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

    // Create payment record
    const payment = await prisma.payment.create({
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

    // Rollback enrollment if payment failed or cancelled
    if (paymentStatus !== 'COMPLETED') {
      await prisma.enrollment.delete({ where: { id: enrollment.id } });
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
      message: 'Payment processed successfully',
    });
  } catch (error) {
    console.error('Error creating custom payment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



// Create custom payment for cart
export const createCartPayment = async (req: Request, res: Response) => {
  try {
    const {
      items,
      total,
      userId,
      userEmail,  // currently unused, but keep if you want
      userName,   // currently unused, but keep if you want
      paymentMethod,
      paymentDetails, // currently unused, you can store if needed
      testStatus,
    } = req.body;

    const currentUserId = (req as any).user?.id;

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

    // Validate total amount
    const calculatedTotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total amount',
      });
    }

    // Determine payment status and paidAt date
    let paymentStatus: 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'COMPLETED';
    let paidAt: Date | null = new Date();

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
      // Normalize intakeId: null if missing or invalid string
      const intakeId =
        item.intakeId && typeof item.intakeId === 'string' && item.intakeId.trim() !== ''
          ? item.intakeId.trim()
          : null;

      // OPTIONAL: Validate intakeId exists for this course
      // const course = await prisma.course.findUnique({
      //   where: { id: item.courseId },
      //   include: { intakes: { where: { isActive: true } } },
      // });
      // if (intakeId && (!course || !course.intakes.some(i => i.id === intakeId))) {
      //   continue; // skip this item or handle error as needed
      // }

      // Check if already enrolled for this user, course, and intake
      const existingEnrollment = await prisma.enrollment.findFirst({
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
        // Already enrolled, skip this item
        continue;
      }

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: userId,
          courseId: item.courseId,
          ...(intakeId ? { intakeId } : {}),
          status: 'ACTIVE',
        },
      });
      enrollments.push(enrollment);

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          userId,
          enrollmentId: enrollment.id,
          amount: item.amount,
          currency: 'BDT',
          method: paymentMethod,
          status: paymentStatus,
          referenceId: `FREE_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          paidAt,
          // If you want to store paymentDetails, add a JSON field in your Prisma model first and then include here:
          // ...(paymentDetails ? { metadata: paymentDetails } : {}),
        },
      });
      payments.push(payment);
    }

    // If payment failed or cancelled, rollback created enrollments
    if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      // Delete enrollments in parallel
      await Promise.all(
        enrollments.map((enrollment) =>
          prisma.enrollment.delete({ where: { id: enrollment.id } })
        )
      );

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
      message: 'Cart payment processed successfully',
    });
  } catch (error) {
    console.error('Error creating cart payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// Create free enrollment
export const createFreeEnrollment = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;
    let intakeId: string | null = req.body.intakeId;

    const userId = (req as any).user?.id;

    // ✅ Normalize intakeId string values like "null", "undefined"
    if (!intakeId || intakeId === 'null' || intakeId === 'undefined' || intakeId === 'No Intake' || intakeId.trim() === '') {
      intakeId = null;
    }

    // ✅ Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // ✅ Check courseId
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // ✅ Check if already enrolled in this course (with or without intake)
    const existingEnrollment = await prisma.enrollment.findFirst({
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

    // ✅ Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: userId,
        courseId,
        status: 'ACTIVE',
        ...(intakeId ? { intakeId } : {}) // only include intakeId if it's valid
      }
    });

    // ✅ Create free payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        enrollmentId: enrollment.id,
        amount: 0,
        currency: 'BDT',
        method: PaymentMethod.CUSTOM,
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

  } catch (error) {
    console.error('Error creating free enrollment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
