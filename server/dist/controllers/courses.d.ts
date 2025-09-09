import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getAllCourses: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCoursesByTeacher: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCourseById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createCourse: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCourse: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCourse: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCourseEnrollments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=courses.d.ts.map