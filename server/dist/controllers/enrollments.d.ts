import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const getAllEnrollments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEnrollmentById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEnrollmentsByStudent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEnrollmentsByCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEnrollmentByStudentAndCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createEnrollment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateEnrollmentStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPendingEnrollments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const approveEnrollment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rejectEnrollment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteEnrollment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=enrollments.d.ts.map