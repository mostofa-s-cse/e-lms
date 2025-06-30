import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse, AuthRequest } from '../types';
import path from 'path';
import fs from 'fs';

export const getAllNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notes = await prisma.note.findMany({
      where: { isActive: true },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, message: 'Notes fetched successfully', data: notes } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getNotesByCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = req.params.courseId;
    
    const notes = await prisma.note.findMany({
      where: { 
        courseId,
        isActive: true 
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, message: 'Course notes fetched successfully', data: notes } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    
    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }
    
    res.json({ success: true, message: 'Note fetched successfully', data: note } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, courseId } = req.body;
    const teacherId = req.user!.id;
    
    if (!req.file) {
      res.status(400).json({ success: false, message: 'File is required' });
      return;
    }
    
    // Check if user is the teacher of this course or admin
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }
    
    if (course.teacherId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only create notes for your own courses' });
      return;
    }
    
    const note = await prisma.note.create({
      data: {
        title,
        description,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        courseId,
        authorId: teacherId
      },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    
    res.status(201).json({ success: true, message: 'Note created successfully', data: note } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description } = req.body;
    const noteId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the author of this note or admin
    const existingNote = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        course: true
      }
    });
    
    if (!existingNote) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }
    
    if (existingNote.authorId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only update your own notes' });
      return;
    }
    
    const note = await prisma.note.update({
      where: { id: noteId },
      data: { title, description },
      include: {
        course: {
          select: { id: true, title: true, code: true }
        },
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    
    res.json({ success: true, message: 'Note updated successfully', data: note } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const noteId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the author of this note or admin
    const existingNote = await prisma.note.findUnique({
      where: { id: noteId }
    });
    
    if (!existingNote) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }
    
    if (existingNote.authorId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only delete your own notes' });
      return;
    }
    
    // Delete the file from filesystem if it exists
    const filePath = path.join(__dirname, '..', '..', existingNote.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Soft delete by setting isActive to false
    await prisma.note.update({
      where: { id: noteId },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Note deleted successfully' } as ApiResponse);
  } catch (error) {
    next(error);
  }
}; 