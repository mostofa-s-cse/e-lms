import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse, AuthRequest } from '../types';

// Get all quizzes
export const getAllQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { isActive: true },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, message: 'Quizzes fetched successfully', data: quizzes } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

// Get quizzes by teacher
export const getQuizzesByTeacher = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacherId = req.user!.id;
    
    const quizzes = await prisma.quiz.findMany({
      where: { 
        authorId: teacherId,
        isActive: true 
      },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, message: 'Teacher quizzes fetched successfully', data: quizzes } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

// Get quiz by ID
export const getQuizById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    
    if (!quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }
    
    res.json({ success: true, message: 'Quiz fetched successfully', data: quiz } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

// Get quizzes by course
export const getQuizzesByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;

    const quizzes = await prisma.quiz.findMany({
      where: { 
        courseId,
        isActive: true 
      },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        },
        questions: {
          select: {
            id: true,
            question: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// Create new quiz
export const createQuiz = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, duration, totalMarks, passingMarks, courseId ,teacherId} = req.body;
  
    console.log('createQuiz: Request body:', req.body);
    console.log('createQuiz: Teacher ID from token:', teacherId);
    console.log('createQuiz: User object:', req.user);
    
    // Parse numeric fields from FormData strings
    const parsedDuration = parseInt(duration) || 30;
    const parsedTotalMarks = parseInt(totalMarks) || 100;
    const parsedPassingMarks = parseInt(passingMarks) || 70;
    
    // Verify that the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: teacherId }
    });
    
    if (!user) {
      console.log('createQuiz: User not found in database:', teacherId);
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    
    console.log('createQuiz: User found:', user.email, user.role);
    
    // Check if user is the teacher of this course or admin
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }
    
    console.log('createQuiz: Course found:', course.title, 'Teacher ID:', course.teacherId);
    
    if (course.teacherId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only create quizzes for your own courses' });
      return;
    }
    
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        duration: parsedDuration,
        totalMarks: parsedTotalMarks,
        passingMarks: parsedPassingMarks,
        courseId,
        authorId: teacherId
      },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    
    res.status(201).json({ success: true, message: 'Quiz created successfully', data: quiz } as ApiResponse);
  } catch (error) {
    console.error('createQuiz: Error creating quiz:', error);
    next(error);
  }
};

// Update quiz
export const updateQuiz = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, duration, totalMarks, passingMarks, isActive } = req.body;
    const quizId = req.params.id;
    const teacherId = req.user!.id;
    
    // Parse numeric fields from FormData strings
    const parsedDuration = duration ? parseInt(duration) : undefined;
    const parsedTotalMarks = totalMarks ? parseInt(totalMarks) : undefined;
    const parsedPassingMarks = passingMarks ? parseInt(passingMarks) : undefined;
    
    // Check if user is the author of this quiz or admin
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });
    
    if (!existingQuiz) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }
    
    if (existingQuiz.authorId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only update your own quizzes' });
      return;
    }
    
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: { 
        title, 
        description, 
        duration: parsedDuration, 
        totalMarks: parsedTotalMarks, 
        passingMarks: parsedPassingMarks, 
        isActive 
      },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    
    res.json({ success: true, message: 'Quiz updated successfully', data: quiz } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

// Delete quiz
export const deleteQuiz = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const quizId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the author of this quiz or admin
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });
    
    if (!existingQuiz) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }
    
    if (existingQuiz.authorId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only delete your own quizzes' });
      return;
    }
    
    // Soft delete by setting isActive to false
    await prisma.quiz.update({
      where: { id: quizId },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Quiz deleted successfully' } as ApiResponse);
  } catch (error) {
    next(error);
  }
}; 