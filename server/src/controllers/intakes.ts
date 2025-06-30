import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse, AuthRequest } from '../types';

export const getAllIntakes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const intakes = await prisma.intake.findMany({
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
    res.json({ success: true, message: 'Intakes fetched successfully', data: intakes } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getIntakeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const intake = await prisma.intake.findUnique({
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
    
    res.json({ success: true, message: 'Intake fetched successfully', data: intake } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const createIntake = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, startDate, endDate, courseId } = req.body;
    const teacherId = req.user!.id;
    
    // Check if user is the teacher of this course or admin
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }
    
    if (course.teacherId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only create intakes for your own courses' });
      return;
    }
    
    const intake = await prisma.intake.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        courseId
      },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        }
      }
    });
    
    res.status(201).json({ success: true, message: 'Intake created successfully', data: intake } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const updateIntake = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    const intakeId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the teacher of this course or admin
    const existingIntake = await prisma.intake.findUnique({
      where: { id: intakeId },
      include: {
        course: true
      }
    });
    
    if (!existingIntake) {
      res.status(404).json({ success: false, message: 'Intake not found' });
      return;
    }
    
    if (existingIntake.course.teacherId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only update intakes for your own courses' });
      return;
    }
    
    const intake = await prisma.intake.update({
      where: { id: intakeId },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive
      },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        }
      }
    });
    
    res.json({ success: true, message: 'Intake updated successfully', data: intake } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const deleteIntake = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const intakeId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the teacher of this course or admin
    const existingIntake = await prisma.intake.findUnique({
      where: { id: intakeId },
      include: {
        course: true
      }
    });
    
    if (!existingIntake) {
      res.status(404).json({ success: false, message: 'Intake not found' });
      return;
    }
    
    if (existingIntake.course.teacherId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only delete intakes for your own courses' });
      return;
    }
    
    // Soft delete by setting isActive to false
    await prisma.intake.update({
      where: { id: intakeId },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Intake deleted successfully' } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getIntakeEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const intakeId = req.params.id;
    
    const enrollments = await prisma.enrollment.findMany({
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
    
    res.json({ success: true, message: 'Intake enrollments fetched successfully', data: enrollments } as ApiResponse);
  } catch (error) {
    next(error);
  }
}; 