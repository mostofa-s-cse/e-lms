import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getQuizAttemptsByQuiz: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getQuizAttemptById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllQuizAttempts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createQuizAttempt: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteQuizAttempt: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getStudentQuizAttempts: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getStudentQuizAttemptsByQuiz: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=quizAttempts.d.ts.map