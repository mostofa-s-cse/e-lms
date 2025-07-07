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
        // For free courses without intakes, create a default intake
        const defaultIntake = await prisma.intake.create({
          data: {
            name: `Default Intake - ${course.title}`,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            amount: 0.0,
            isActive: true,
            courseId
          }
        });
        finalIntakeId = defaultIntake.id;
      } else {
        res.status(400).json({
          success: false,
          message: 'Intake selection is required for paid courses',
        });
        return;
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
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId_intakeId: {
          studentId,
          courseId,
          intakeId: finalIntakeId,
        },
      },
    });

    if (existingEnrollment) {
      res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course',
      });
      return;
    }

    // Check if this is a free course (either course is free or intake amount is 0)
    const intake = await prisma.intake.findUnique({
      where: { id: finalIntakeId }
    });
    
    const isFreeCourse = course.isFree || (intake && intake.amount === 0);

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        intakeId: finalIntakeId,
        status: EnrollmentStatus.ACTIVE,
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