import { Request, Response } from 'express';
import { prisma } from '../utils/database';

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