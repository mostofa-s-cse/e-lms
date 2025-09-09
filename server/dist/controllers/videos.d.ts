import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getAllVideos: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getVideosByCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getVideoById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getVideosByTeacher: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createVideo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateVideo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteVideo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=videos.d.ts.map