import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getAllQuestions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getQuestionById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getQuestionsByQuiz: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createQuestion: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateQuestion: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteQuestion: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=questions.d.ts.map