import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse, AuthRequest } from '../types';

export const getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        _count: {
          select: { enrollments: true, notes: true, videos: true, quizzes: true }
        },
        batches: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' }
        }
      }
    });
    res.json({ success: true, message: 'Courses fetched successfully', data: courses } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getCoursesByTeacher = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('getCoursesByTeacher: Request user:', req.user);
    console.log('getCoursesByTeacher: User ID:', req.user?.id);
    console.log('getCoursesByTeacher: User role:', req.user?.role);
    
    const teacherId = req.user!.id;
    
    console.log('getCoursesByTeacher: Fetching courses for teacher ID:', teacherId);
    
    const courses = await prisma.course.findMany({
      where: { 
        teacherId: teacherId,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        _count: {
          select: { enrollments: true, notes: true, videos: true, quizzes: true }
        },
        batches: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' }
        }
      }
    });
    
    console.log('getCoursesByTeacher: Found courses:', courses.length);
    
    res.json({ success: true, message: 'Teacher courses fetched successfully', data: courses } as ApiResponse);
  } catch (error) {
    console.error('getCoursesByTeacher: Error:', error);
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
        batches: {
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
    const { title, description, code, credits, price, isFree, teacherId } = req.body;
    
    // Determine the teacher ID based on user role
    let finalTeacherId: string;
    if (req.user!.role === 'ADMIN' && teacherId) {
      // Admin can assign any teacher
      finalTeacherId = teacherId;
    } else {
      // Regular teachers can only assign themselves
      finalTeacherId = req.user!.id;
    }
    
        // Handle thumbnail file upload
    let thumbnail = null;
    if (req.file) {
      thumbnail = `/uploads/thumbnails/${req.file.filename}`; 
    } else {
      thumbnail = null;
    }
    
    const courseData = {
      title,
      description,
      code,
      credits: credits ? parseInt(credits) : 0,
      price: price ? parseFloat(price) : 0.0,
      isFree: isFree === 'true' || isFree === true,
      thumbnail,
      teacherId: finalTeacherId
    };
    
    const course = await prisma.course.create({
      data: courseData,
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
    
    
    res.status(201).json({ success: true, message: 'Course created successfully', data: course } as ApiResponse);
  } catch (error: any) {
    console.error('Error creating course:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Course code already exists' });
      return;
    }
    next(error);
  }
};

export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, code, credits, isActive, price, isFree, teacherId } = req.body;
    const courseId = req.params.id;
    const currentUserId = req.user!.id;
    
    // Check if user is the teacher of this course or admin
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!existingCourse) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }
    
    if (existingCourse.teacherId !== currentUserId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only update your own courses' });
      return;
    }
    
    // Handle thumbnail file upload
    let thumbnail = undefined;
    if (req.file) {
      thumbnail = `/uploads/thumbnails/${req.file.filename}`; // Store public URL path
    }
    
    // Prepare update data
    const updateData: any = { 
      title, 
      description, 
      code, 
      credits: credits ? parseInt(credits) : undefined,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : undefined,
      price: price !== undefined ? parseFloat(price) : undefined,
      isFree: isFree !== undefined ? (isFree === 'true' || isFree === true) : undefined,
      thumbnail: thumbnail !== undefined ? thumbnail : undefined
    };
    
    // Only allow admin to change teacher assignment
    if (req.user!.role === 'ADMIN' && teacherId) {
      updateData.teacherId = teacherId;
    }
    
    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
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
        batch: {
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