import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse, AuthRequest } from '../types';

export const getAllVideos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const videos = await prisma.video.findMany({
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
    res.json({ success: true, message: 'Videos fetched successfully', data: videos } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getVideosByCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = req.params.courseId;
    
    const videos = await prisma.video.findMany({
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
    
    res.json({ success: true, message: 'Course videos fetched successfully', data: videos } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getVideoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const video = await prisma.video.findUnique({
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
    
    if (!video) {
      res.status(404).json({ success: false, message: 'Video not found' });
      return;
    }
    
    res.json({ success: true, message: 'Video fetched successfully', data: video } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const createVideo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
 console.log("CREATE VIDEO - Request:", req.files);
  try {
    const { title, description, duration, courseId } = req.body;
    
    const teacherId = req.user!.id;
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: teacherId }
    });
    
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    
    let videoUrlPath = undefined;
    let thumbnailPath = undefined;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files?.videoUrl?.[0]) {
        videoUrlPath = `/uploads/videos/${files.videoUrl[0].filename}`;
      }

      if (files?.thumbnail?.[0]) {
        thumbnailPath = `/uploads/thumbnails/${files.thumbnail[0].filename}`;
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
      res.status(403).json({ success: false, message: 'You can only create videos for your own courses' });
      return;
    }
    
    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl: videoUrlPath || '',
        duration: parseInt(duration) || 0,
        thumbnail: thumbnailPath || '',
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
    
    res.status(201).json({ success: true, message: 'Video created successfully', data: video } as ApiResponse);
  } catch (error) {
    console.log("CREATE VIDEO - Error:", error);
    next(error);
  }
};

export const updateVideo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, duration, isActive } = req.body;
    const videoId = req.params.id;
    const teacherId = req.user!.id;
    
    // Handle file uploads
    let videoUrlPath = undefined;
    let thumbnailPath = undefined;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.videoUrl?.[0]) {
      videoUrlPath = `/uploads/videos/${files.videoUrl[0].filename}`;
    }

    if (files?.thumbnail?.[0]) {
      thumbnailPath = `/uploads/thumbnails/${files.thumbnail[0].filename}`;
    }
    
    // Check if user is the author of this video or admin
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId }
    });
    
    if (!existingVideo) {
      res.status(404).json({ success: false, message: 'Video not found' });
      return;
    }
    
    if (existingVideo.authorId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only update your own videos' });
      return;
    }
    
    // Prepare update data
    const updateData: any = { 
      title, 
      description, 
      duration: parseInt(duration) || 0, 
      isActive 
    };
    if (videoUrlPath !== undefined) updateData.videoUrl = videoUrlPath;
    if (thumbnailPath !== undefined) updateData.thumbnail = thumbnailPath;
    
    const video = await prisma.video.update({
      where: { id: videoId },
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
    
    res.json({ success: true, message: 'Video updated successfully', data: video } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const videoId = req.params.id;
    const teacherId = req.user!.id;
    
    // Check if user is the author of this video or admin
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId }
    });
    
    if (!existingVideo) {
      res.status(404).json({ success: false, message: 'Video not found' });
      return;
    }
    
    if (existingVideo.authorId !== teacherId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only delete your own videos' });
      return;
    }
    
    // Soft delete by setting isActive to false
    await prisma.video.update({
      where: { id: videoId },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Video deleted successfully' } as ApiResponse);
  } catch (error) {
    next(error);
  }
}; 