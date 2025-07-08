import { Request, Response, NextFunction } from 'express';
import { PrismaClient, EnrollmentStatus } from '@prisma/client';

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
        batch: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            amount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
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
        batch: {
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
        batch: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            amount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
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
        batch: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            amount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
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
        batch: {
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
    const { courseId, batchId } = req.body;
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

    // Handle batch selection
    let finalIntakeId = batchId;
    
    if (!batchId) {
      // If no batch provided, try to find an existing batch for this course
      const existingIntake = await prisma.batch.findFirst({
        where: { 
          courseId,
          isActive: true 
        },
        orderBy: { startDate: 'desc' }
      });
      
      if (existingIntake) {
        finalIntakeId = existingIntake.id;
      } else if (course.isFree) {
        // For free courses without batches, allow enrollment without batch
        finalIntakeId = null;
      } else {
        // For paid courses without batches, allow enrollment without batch
        // This handles cases where courses don't have batches defined
        finalIntakeId = null;
      }
    } else {
      // Validate provided batch
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
      });

      if (!batch) {
        res.status(404).json({
          success: false,
          message: 'Batch not found',
        });
        return;
      }
      
      if (batch.courseId !== courseId) {
        res.status(400).json({
          success: false,
          message: 'Batch does not belong to this course',
        });
        return;
      }
    }

    // Check if already enrolled
    let existingEnrollment;
    
    if (finalIntakeId) {
      // Check enrollment with specific batch
      existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId_batchId: {
            studentId,
            courseId,
            batchId: finalIntakeId,
          },
        },
      });
    } else {
      // Check enrollment without batch (for courses without batches)
      existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          studentId,
          courseId,
          batchId: null,
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

    // Check if this is a free course (either course is free or batch amount is 0)
    let batch = null;
    if (finalIntakeId) {
      batch = await prisma.batch.findUnique({
        where: { id: finalIntakeId }
      });
    }
    
    const isFreeCourse = course.isFree || (batch && batch.amount === 0);

    const enrollmentData: any = {
      studentId,
      courseId,
      status: EnrollmentStatus.ACTIVE,
    };

    // Only add batchId if it exists
    if (finalIntakeId) {
      enrollmentData.batchId = finalIntakeId;
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
        batch: {
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
    if (isFreeCourse) {
      await prisma.payment.create({
        data: {
          userId: studentId,
          enrollmentId: enrollment.id,
          amount: 0,
          currency: 'BDT',
          method: 'OTHER',
          status: 'COMPLETED',
          referenceId: `FREE_${enrollment.id}`,
          paidAt: new Date(),
        },
      });
    }

    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Enrollment created successfully',
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
        batch: {
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