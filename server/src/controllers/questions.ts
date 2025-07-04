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

    // Return questions with new schema structure
    const mappedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      isActive: q.isActive,
      quizId: q.quizId,
      quiz: q.quiz,
      author: q.author,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt
    }));

    res.json({ success: true, message: 'Questions fetched successfully', data: mappedQuestions } as ApiResponse);
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

    // Return question with new schema structure
    const mappedQuestion = {
      id: question.id,
      question: question.question,
      type: question.type,
      options: question.options,
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      isActive: question.isActive,
      quizId: question.quizId,
      quiz: question.quiz,
      author: question.author,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    };
    
    res.json({ success: true, message: 'Question fetched successfully', data: mappedQuestion } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getQuestionsByQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quizId } = req.params;
    
    const questions = await prisma.question.findMany({
      where: { 
        quizId,
        isActive: true 
      },
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

    // Return questions with new schema structure
    const mappedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      isActive: q.isActive,
      quizId: q.quizId,
      quiz: q.quiz,
      author: q.author,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt
    }));
    
    res.json({ success: true, message: 'Questions fetched successfully', data: mappedQuestions } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, type, options, correctAnswer, points, quizId } = req.body;
    const teacherId = req.user!.id;
    
    // Map client fields to database fields
    const question = title || content; // Use title or content as question
    const marks = points || 1; // Map points to marks
    
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
        marks,
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

    // Map the response to match client expectations
    const mappedQuestion = {
      id: questionData.id,
      title: questionData.question, // Map question field to title
      content: questionData.question, // Use question as content as well
      type: questionData.type,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      points: questionData.marks, // Map marks to points
      quizId: questionData.quizId,
      quiz: questionData.quiz,
      teacher: questionData.author, // Map author to teacher
      createdAt: questionData.createdAt
    };
    
    res.status(201).json({ success: true, message: 'Question created successfully', data: mappedQuestion } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, type, options, correctAnswer, points, isActive } = req.body;
    const questionId = req.params.id;
    const teacherId = req.user!.id;
    
    // Map client fields to database fields
    const question = title || content; // Use title or content as question
    const marks = points; // Map points to marks
    
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

    // Map the response to match client expectations
    const mappedQuestion = {
      id: questionData.id,
      title: questionData.question, // Map question field to title
      content: questionData.question, // Use question as content as well
      type: questionData.type,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      points: questionData.marks, // Map marks to points
      quizId: questionData.quizId,
      quiz: questionData.quiz,
      teacher: questionData.author, // Map author to teacher
      createdAt: questionData.createdAt
    };
    
    res.json({ success: true, message: 'Question updated successfully', data: mappedQuestion } as ApiResponse);
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