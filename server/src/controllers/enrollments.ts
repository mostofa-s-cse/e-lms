import { Request, Response, NextFunction } from 'express';
import { PrismaClient, EnrollmentStatus, PaymentMethod } from '@prisma/client';

export const prisma = new PrismaClient();

// Get all enrollments
export const getAllEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Get enrollment by ID
export const getEnrollmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const enrollment = await prisma.enrollment.findUnique({
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
  } catch (error) {
    next(error);
  }
};

// Get enrollments by student
export const getEnrollmentsByStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Get enrollments by course
export const getEnrollmentsByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Get enrollment by student and course
export const getEnrollmentByStudentAndCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, courseId } = req.params;

    const enrollment = await prisma.enrollment.findFirst({
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
  } catch (error) {
    next(error);
  }
};

// Create new enrollment
export const createEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, intakeId } = req.body;
    const studentId = (req as any).user.id;

    // Validate required fields
    if (!courseId) {
      res.status(400).json({
        success: false,
        message: 'CourseId is required',
      });
      return;
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found',
      });
      return;
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    // Handle intake selection
    let finalIntakeId = intakeId;
    
    if (!intakeId) {
      // If no intake provided, try to find an existing intake for this course
      const existingIntake = await prisma.intake.findFirst({
        where: { 
          courseId,
          isActive: true 
        },
        orderBy: { startDate: 'desc' }
      });
      
      if (existingIntake) {
        finalIntakeId = existingIntake.id;
      } else if (course.isFree) {
        // For free courses without intakes, allow enrollment without intake
        finalIntakeId = null;
      } else {
        // For paid courses without intakes, allow enrollment without intake
        // This handles cases where courses don't have intakes defined
        finalIntakeId = null;
      }
    } else {
      // Validate provided intake
      const intake = await prisma.intake.findUnique({
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

    // Check if already enrolled
    let existingEnrollment;
    
    if (finalIntakeId) {
      // Check enrollment with specific intake
      existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId_intakeId: {
            studentId,
            courseId,
            intakeId: finalIntakeId,
          },
        },
      });
    } else {
      // Check enrollment without intake (for courses without intakes)
      existingEnrollment = await prisma.enrollment.findFirst({
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

    // Check if this is a free course (either course is free or intake amount is 0)
    let intake = null;
    if (finalIntakeId) {
      intake = await prisma.intake.findUnique({
        where: { id: finalIntakeId }
      });
    }
    
    const isFreeCourse = course.isFree || (intake && intake.amount === 0);

    const enrollmentData: any = {
      studentId,
      courseId,
      status: EnrollmentStatus.PENDING, // All enrollments require admin approval
    };

    // Only add intakeId if it exists
    if (finalIntakeId) {
      enrollmentData.intakeId = finalIntakeId;
    }

    const enrollment = await prisma.enrollment.create({
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

    // For free courses, create a completed payment record with 0 amount
    // Payment will be created after admin approval
    if (isFreeCourse) {
      // Store payment info for later creation when approved
      enrollment.course.isFree = true;
    }

    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Enrollment request submitted successfully! Your enrollment is pending admin approval. You will be notified once it is reviewed.',
    });
  } catch (error) {
    next(error);
  }
};

// Update enrollment status
export const updateEnrollmentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!existingEnrollment) {
      res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
      return;
    }

    const enrollment = await prisma.enrollment.update({
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
  } catch (error) {
    next(error);
  }
};

// Get pending enrollments for admin approval
export const getPendingEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { status: EnrollmentStatus.PENDING },
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
  } catch (error) {
    next(error);
  }
};

// Approve enrollment
export const approveEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.id;

    // Check if enrollment exists and is pending
    const existingEnrollment = await prisma.enrollment.findUnique({
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

    if (existingEnrollment.status !== EnrollmentStatus.PENDING) {
      res.status(400).json({
        success: false,
        message: 'Enrollment is not pending approval',
      });
      return;
    }

    // Update enrollment status to ACTIVE
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: { 
        status: EnrollmentStatus.ACTIVE,
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

    // For free courses, create a completed payment record with 0 amount after approval
    const isFreeCourse = existingEnrollment.course.isFree || (existingEnrollment.intake && existingEnrollment.intake.amount === 0);
    if (isFreeCourse) {
      await prisma.payment.create({
        data: {
          userId: existingEnrollment.studentId,
          enrollmentId: enrollment.id,
          amount: 0,
          currency: 'BDT',
          method: PaymentMethod.CUSTOM,
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
  } catch (error) {
    next(error);
  }
};

// Reject enrollment
export const rejectEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = (req as any).user.id;

    // Check if enrollment exists and is pending
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!existingEnrollment) {
      res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
      return;
    }

    if (existingEnrollment.status !== EnrollmentStatus.PENDING) {
      res.status(400).json({
        success: false,
        message: 'Enrollment is not pending approval',
      });
      return;
    }

    // Update enrollment status to DROPPED (rejected)
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: { 
        status: EnrollmentStatus.DROPPED,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || 'No reason provided',
        approvedBy: adminId, // Track who rejected it
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
  } catch (error) {
    next(error);
  }
};

// Delete enrollment
export const deleteEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!existingEnrollment) {
      res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
      return;
    }

    await prisma.enrollment.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Enrollment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}; 