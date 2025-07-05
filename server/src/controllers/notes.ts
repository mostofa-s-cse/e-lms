import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse, AuthRequest } from '../types';
import path from 'path';
import fs from 'fs';

export const getAllNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, authorId, isImage } = req.query;
    
    // Build where clause
    const whereClause: any = { isActive: true };
    
    if (courseId) {
      whereClause.courseId = courseId as string;
    }
    
    if (authorId) {
      whereClause.authorId = authorId as string;
    }
    
    if (isImage !== undefined) {
      whereClause.isImage = isImage === 'true';
    }
    
    const notes = await prisma.note.findMany({
      where: whereClause,
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
    
    // Validate required fields
    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Title is required' });
      return;
    }
    
    if (!courseId) {
      res.status(400).json({ success: false, message: 'Course is required' });
      return;
    }
    
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
    
    // Determine if the file is an image
    const isImage = req.file.mimetype.startsWith('image/');
    
    // Validate file size (max 10MB)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxFileSize) {
      res.status(400).json({ success: false, message: 'File size too large. Maximum allowed size is 10MB.' });
      return;
    }
    
    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        attachment: `/uploads/notes/${req.file.filename}`,
        attachmentSize: req.file.size,
        attachmentType: req.file.mimetype,
        isImage,
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
    
    // Validate required fields
    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Title is required' });
      return;
    }
    
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
    
    // Prepare update data
    const updateData: any = {
      title: title.trim(),
      description: description?.trim() || null
    };
    
    // Handle file update if a new file is uploaded
    if (req.file) {
      // Validate file size (max 10MB)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxFileSize) {
        res.status(400).json({ success: false, message: 'File size too large. Maximum allowed size is 10MB.' });
        return;
      }
      
      // Delete old file if it exists
      if (existingNote.attachment) {
        const oldFilePath = path.join(__dirname, '..', '..', existingNote.attachment);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Determine if the new file is an image
      const isImage = req.file.mimetype.startsWith('image/');
      
      updateData.attachment = `/uploads/notes/${req.file.filename}`;
      updateData.attachmentSize = req.file.size;
      updateData.attachmentType = req.file.mimetype;
      updateData.isImage = isImage;
    }
    
    const note = await prisma.note.update({
      where: { id: noteId },
      data: updateData,
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
    if (existingNote.attachment) {
      const filePath = path.join(__dirname, '..', '..', existingNote.attachment);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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

export const getNoteStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.query;
    
    const whereClause: any = { isActive: true };
    if (courseId) {
      whereClause.courseId = courseId as string;
    }
    
    const [totalNotes, imageNotes, documentNotes, totalSize] = await Promise.all([
      prisma.note.count({ where: whereClause }),
      prisma.note.count({ where: { ...whereClause, isImage: true } }),
      prisma.note.count({ where: { ...whereClause, isImage: false } }),
      prisma.note.aggregate({
        where: whereClause,
        _sum: { attachmentSize: true }
      })
    ]);
    
    const stats = {
      totalNotes,
      imageNotes,
      documentNotes,
      totalSize: totalSize._sum.attachmentSize || 0,
      averageSize: totalNotes > 0 ? Math.round((totalSize._sum.attachmentSize || 0) / totalNotes) : 0
    };
    
    res.json({ success: true, message: 'Note statistics fetched successfully', data: stats } as ApiResponse);
  } catch (error) {
    next(error);
  }
}; 