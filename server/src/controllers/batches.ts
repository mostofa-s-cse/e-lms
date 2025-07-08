import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse, AuthRequest } from '../types';

export const getAllIntakes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const batches = await prisma.batch.findMany({
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
    res.json({ success: true, message: 'Batches fetched successfully', data: batches } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getIntakesByTeacher = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacherId = req.user!.id;
    
    // Get batches for courses that the teacher teaches
    const batches = await prisma.batch.findMany({
      where: { 
        isActive: true,
        course: {
          teacherId: teacherId
        }
      },
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
    
    res.json({ success: true, message: 'Teacher batches fetched successfully', data: batches } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getIntakeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const batch = await prisma.batch.findUnique({
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
    
    if (!batch) {
      res.status(404).json({ success: false, message: 'Batch not found' });
      return;
    }
    
    res.json({ success: true, message: 'Batch fetched successfully', data: batch } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const createIntake = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, startDate, endDate, courseId, amount } = req.body;
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
      res.status(403).json({ success: false, message: 'You can only create batches for your own courses' });
      return;
    }
    
    const batch = await prisma.batch.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        courseId,
        amount: amount ? parseFloat(amount) : 0.0
      },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        }
      }
    });
    
    res.status(201).json({ success: true, message: 'Batch created successfully', data: batch } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const updateIntake = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, startDate, endDate, isActive, amount } = req.body;
    const batchId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the teacher of this course or admin
    const existingIntake = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        course: true
      }
    });
    
    if (!existingIntake) {
      res.status(404).json({ success: false, message: 'Batch not found' });
      return;
    }
    
    if (existingIntake.course.teacherId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only update batches for your own courses' });
      return;
    }
    
    const batch = await prisma.batch.update({
      where: { id: batchId },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
        amount: amount !== undefined ? parseFloat(amount) : undefined
      },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        }
      }
    });
    
    res.json({ success: true, message: 'Batch updated successfully', data: batch } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const deleteIntake = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const batchId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the teacher of this course or admin
    const existingIntake = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        course: true
      }
    });
    
    if (!existingIntake) {
      res.status(404).json({ success: false, message: 'Batch not found' });
      return;
    }
    
    if (existingIntake.course.teacherId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only delete batches for your own courses' });
      return;
    }
    
    // Soft delete by setting isActive to false
    await prisma.batch.update({
      where: { id: batchId },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Batch deleted successfully' } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getIntakeEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const batchId = req.params.id;
    
    const enrollments = await prisma.enrollment.findMany({
      where: { batchId },
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
    
    res.json({ success: true, message: 'Batch enrollments fetched successfully', data: enrollments } as ApiResponse);
  } catch (error) {
    next(error);
  }
}; 