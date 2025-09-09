import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getAllQuizzes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getQuizzesByTeacher: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getQuizById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getQuizzesByCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createQuiz: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateQuiz: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteQuiz: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=quizzes.d.ts.map