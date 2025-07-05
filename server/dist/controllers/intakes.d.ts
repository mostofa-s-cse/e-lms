import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getAllIntakes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getIntakeById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createIntake: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateIntake: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteIntake: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getIntakeEnrollments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=intakes.d.ts.map