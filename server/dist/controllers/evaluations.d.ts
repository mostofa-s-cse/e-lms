import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const getAllEvaluations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEvaluationsByTeacher: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getEvaluationById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEvaluationsByCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createEvaluation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateEvaluation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteEvaluation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=evaluations.d.ts.map