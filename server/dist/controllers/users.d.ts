import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getAllUsers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTeachers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getStudents: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPendingApprovals: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUserApproval: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUserProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=users.d.ts.map