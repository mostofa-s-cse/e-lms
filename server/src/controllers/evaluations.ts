import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';

export const prisma = new PrismaClient();

// Get all evaluations
export const getAllEvaluations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const evaluations = await prisma.evaluation.findMany({
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        evaluator: {
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
          },
        },
      },
    });

    res.json({
      success: true,
      data: evaluations,
    });
  } catch (error) {
    next(error);
  }
};

// Get evaluations by teacher
export const getEvaluationsByTeacher = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacherId = req.user!.id;
    
    const evaluations = await prisma.evaluation.findMany({
      where: { 
        evaluatorId: teacherId
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
        evaluator: {
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
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: evaluations,
      message: 'Teacher evaluations fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get evaluation by ID
export const getEvaluationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const evaluation = await prisma.evaluation.findUnique({
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
        evaluator: {
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
          },
        },
      },
    });

    if (!evaluation) {
      res.status(404).json({
        success: false,
        message: 'Evaluation not found',
      });
      return;
    }

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

// Get evaluations by course
export const getEvaluationsByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;

    const evaluations = await prisma.evaluation.findMany({
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
        evaluator: {
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
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: evaluations,
      message: 'Course evaluations fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Create new evaluation
export const createEvaluation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
};

// Update evaluation
export const updateEvaluation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, type, score, maxScore, feedback } = req.body;

    // Check if evaluation exists
    const existingEvaluation = await prisma.evaluation.findUnique({
      where: { id },
    });

    if (!existingEvaluation) {
      res.status(404).json({
        success: false,
        message: 'Evaluation not found',
      });
      return;
    }

    const evaluation = await prisma.evaluation.update({
      where: { id },
      data: {
        title,
        description,
        type,
        score: score ? parseFloat(score) : undefined,
        maxScore: maxScore ? parseFloat(maxScore) : undefined,
        feedback,
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
        evaluator: {
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
          },
        },
      },
    });

    res.json({
      success: true,
      data: evaluation,
      message: 'Evaluation updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete evaluation
export const deleteEvaluation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if evaluation exists
    const existingEvaluation = await prisma.evaluation.findUnique({
      where: { id },
    });

    if (!existingEvaluation) {
      res.status(404).json({
        success: false,
        message: 'Evaluation not found',
      });
      return;
    }

    await prisma.evaluation.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Evaluation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}; 