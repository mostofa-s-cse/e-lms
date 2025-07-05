import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const getAllEvaluations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEvaluationById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEvaluationsByCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createEvaluation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateEvaluation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteEvaluation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=evaluations.d.ts.map