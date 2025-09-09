import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthRequest } from '../types';
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireRole: (roles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authorizeRoles: (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireTeacher: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireStudent: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map