import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse, AuthRequest } from '../types';

// Get all quiz attempts for a specific quiz
export const getQuizAttemptsByQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quizId } = req.params;
    
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            passingMarks: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      message: 'Quiz attempts fetched successfully', 
      data: attempts 
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

// Get a single quiz attempt by ID
export const getQuizAttemptById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            totalMarks: true,
            passingMarks: true,
            duration: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                type: true,
                options: true,
                correctAnswer: true,
                marks: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    
    if (!attempt) {
      res.status(404).json({ success: false, message: 'Quiz attempt not found' });
      return;
    }
    
    res.json({ 
      success: true, 
      message: 'Quiz attempt fetched successfully', 
      data: attempt 
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

// Get all quiz attempts (for admin/teacher dashboard)
export const getAllQuizAttempts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            passingMarks: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      message: 'All quiz attempts fetched successfully', 
      data: attempts 
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

// Create a new quiz attempt
export const createQuizAttempt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quizId, answers } = req.body;
    const studentId = req.user!.id;
    
    // Check if user is a student
    if (req.user!.role !== 'STUDENT') {
      res.status(403).json({ success: false, message: 'Only students can take quizzes' });
      return;
    }
    
    // Check if quiz exists and is active
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });
    
    if (!quiz || !quiz.isActive) {
      res.status(404).json({ success: false, message: 'Quiz not found or inactive' });
      return;
    }
    
    // Check if student has already attempted this quiz
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        studentId
      }
    });
    
    if (existingAttempt) {
      res.status(400).json({ success: false, message: 'You have already attempted this quiz' });
      return;
    }
    
    // Calculate score based on answers
    let totalScore = 0;
    const questions = await prisma.question.findMany({
      where: { quizId, isActive: true }
    });
    
    // Create quiz answers and calculate score
    const quizAnswers = [];
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (question) {
        const isCorrect = question.correctAnswer === answer.answer;
        const marksEarned = isCorrect ? question.marks : 0;
        totalScore += marksEarned;
        
        quizAnswers.push({
          answer: answer.answer,
          isCorrect,
          marksEarned,
          questionId: answer.questionId
        });
      }
    }
    
    const isPassed = totalScore >= quiz.passingMarks;
    
    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId,
        quizId,
        score: totalScore,
        totalMarks: quiz.totalMarks,
        isPassed,
        startedAt: new Date(),
        completedAt: new Date(),
        answers: {
          create: quizAnswers
        }
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            passingMarks: true
          }
        }
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Quiz attempt submitted successfully', 
      data: attempt 
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

// Delete a quiz attempt (admin/teacher only)
export const deleteQuizAttempt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if user is admin or teacher
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'TEACHER') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }
    
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id }
    });
    
    if (!attempt) {
      res.status(404).json({ success: false, message: 'Quiz attempt not found' });
      return;
    }
    
    await prisma.quizAttempt.delete({
      where: { id }
    });
    
    res.json({ 
      success: true, 
      message: 'Quiz attempt deleted successfully' 
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
}; 