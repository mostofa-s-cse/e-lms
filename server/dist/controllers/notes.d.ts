import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getAllNotes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getNotesByTeacher: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getNotesByCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getNoteById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createNote: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateNote: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteNote: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getNoteStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=notes.d.ts.map