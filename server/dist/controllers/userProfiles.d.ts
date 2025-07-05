import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getUserProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createUserProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUserProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteUserProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllUserProfiles: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=userProfiles.d.ts.map