import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse, AuthRequest } from '../types';

export const getAllQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      include: {
        quiz: {
          select: { id: true, title: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, message: 'Questions fetched successfully', data: questions } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: {
        quiz: {
          select: { id: true, title: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    
    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found' });
      return;
    }
    
    res.json({ success: true, message: 'Question fetched successfully', data: question } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { question, type, options, correctAnswer, marks, quizId } = req.body;
    const teacherId = req.user!.id;
    
    // Check if user is the author of this quiz or admin
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });
    
    if (!quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }
    
    if (quiz.authorId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only create questions for your own quizzes' });
      return;
    }
    
    const questionData = await prisma.question.create({
      data: {
        question,
        type,
        options: options || [],
        correctAnswer,
        marks: marks || 1,
        quizId,
        authorId: teacherId
      },
      include: {
        quiz: {
          select: { id: true, title: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    
    res.status(201).json({ success: true, message: 'Question created successfully', data: questionData } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { question, type, options, correctAnswer, marks, isActive } = req.body;
    const questionId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the author of this question or admin
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    });
    
    if (!existingQuestion) {
      res.status(404).json({ success: false, message: 'Question not found' });
      return;
    }
    
    if (existingQuestion.authorId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only update your own questions' });
      return;
    }
    
    const questionData = await prisma.question.update({
      where: { id: questionId },
      data: { question, type, options, correctAnswer, marks, isActive },
      include: {
        quiz: {
          select: { id: true, title: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    
    res.json({ success: true, message: 'Question updated successfully', data: questionData } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the author of this question or admin
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    });
    
    if (!existingQuestion) {
      res.status(404).json({ success: false, message: 'Question not found' });
      return;
    }
    
    if (existingQuestion.authorId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only delete your own questions' });
      return;
    }
    
    // Soft delete by setting isActive to false
    await prisma.question.update({
      where: { id: questionId },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Question deleted successfully' } as ApiResponse);
  } catch (error) {
    next(error);
  }
}; 