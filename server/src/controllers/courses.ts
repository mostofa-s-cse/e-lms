import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse, AuthRequest } from '../types';

export const getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        _count: {
          select: { enrollments: true, notes: true, videos: true, quizzes: true }
        }
      }
    });
    res.json({ success: true, message: 'Courses fetched successfully', data: courses } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        intakes: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' }
        },
        _count: {
          select: { enrollments: true, notes: true, videos: true, quizzes: true }
        }
      }
    });
    
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }
    
    res.json({ success: true, message: 'Course fetched successfully', data: course } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, code, credits } = req.body;
    const teacherId = req.user!.id;
    
    const course = await prisma.course.create({
      data: {
        title,
        description,
        code,
        credits: credits || 0,
        teacherId
      },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
    
    res.status(201).json({ success: true, message: 'Course created successfully', data: course } as ApiResponse);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Course code already exists' });
      return;
    }
    next(error);
  }
};

export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, code, credits, isActive } = req.body;
    const courseId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the teacher of this course or admin
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!existingCourse) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }
    
    if (existingCourse.teacherId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only update your own courses' });
      return;
    }
    
    const course = await prisma.course.update({
      where: { id: courseId },
      data: { title, description, code, credits, isActive },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
    
    res.json({ success: true, message: 'Course updated successfully', data: course } as ApiResponse);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Course code already exists' });
      return;
    }
    next(error);
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the teacher of this course or admin
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!existingCourse) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }
    
    if (existingCourse.teacherId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only delete your own courses' });
      return;
    }
    
    // Soft delete by setting isActive to false
    await prisma.course.update({
      where: { id: courseId },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Course deleted successfully' } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getCourseEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseId = req.params.id;
    
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        intake: {
          select: { id: true, name: true, startDate: true, endDate: true }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });
    
    res.json({ success: true, message: 'Course enrollments fetched successfully', data: enrollments } as ApiResponse);
  } catch (error) {
    next(error);
  }
}; 