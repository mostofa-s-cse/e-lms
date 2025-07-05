"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVideo = exports.updateVideo = exports.createVideo = exports.getVideoById = exports.getVideosByCourse = exports.getAllVideos = void 0;
const database_1 = require("../utils/database");
const getAllVideos = async (req, res, next) => {
    try {
        const videos = await database_1.prisma.video.findMany({
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
        res.json({ success: true, message: 'Videos fetched successfully', data: videos });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllVideos = getAllVideos;
const getVideosByCourse = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const videos = await database_1.prisma.video.findMany({
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
        res.json({ success: true, message: 'Course videos fetched successfully', data: videos });
    }
    catch (error) {
        next(error);
    }
};
exports.getVideosByCourse = getVideosByCourse;
const getVideoById = async (req, res, next) => {
    try {
        const video = await database_1.prisma.video.findUnique({
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
        res.json({ success: true, message: 'Video fetched successfully', data: video });
    }
    catch (error) {
        next(error);
    }
};
exports.getVideoById = getVideoById;
const createVideo = async (req, res, next) => {
    console.log("CREATE VIDEO - Request:", req.files);
    try {
        const { title, description, duration, courseId } = req.body;
        const teacherId = req.user.id;
        const user = await database_1.prisma.user.findUnique({
            where: { id: teacherId }
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        let videoUrlPath = undefined;
        let thumbnailPath = undefined;
        const files = req.files;
        if (files?.videoUrl?.[0]) {
            videoUrlPath = `/uploads/videos/${files.videoUrl[0].filename}`;
        }
        if (files?.thumbnail?.[0]) {
            thumbnailPath = `/uploads/thumbnails/${files.thumbnail[0].filename}`;
        }
        const course = await database_1.prisma.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }
        if (course.teacherId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only create videos for your own courses' });
            return;
        }
        const video = await database_1.prisma.video.create({
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
        res.status(201).json({ success: true, message: 'Video created successfully', data: video });
    }
    catch (error) {
        console.log("CREATE VIDEO - Error:", error);
        next(error);
    }
};
exports.createVideo = createVideo;
const updateVideo = async (req, res, next) => {
    try {
        const { title, description, duration, isActive } = req.body;
        const videoId = req.params.id;
        const teacherId = req.user.id;
        let videoUrlPath = undefined;
        let thumbnailPath = undefined;
        const files = req.files;
        if (files?.videoUrl?.[0]) {
            videoUrlPath = `/uploads/videos/${files.videoUrl[0].filename}`;
        }
        if (files?.thumbnail?.[0]) {
            thumbnailPath = `/uploads/thumbnails/${files.thumbnail[0].filename}`;
        }
        const existingVideo = await database_1.prisma.video.findUnique({
            where: { id: videoId }
        });
        if (!existingVideo) {
            res.status(404).json({ success: false, message: 'Video not found' });
            return;
        }
        if (existingVideo.authorId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only update your own videos' });
            return;
        }
        const updateData = {
            title,
            description,
            duration: parseInt(duration) || 0,
            isActive
        };
        if (videoUrlPath !== undefined)
            updateData.videoUrl = videoUrlPath;
        if (thumbnailPath !== undefined)
            updateData.thumbnail = thumbnailPath;
        const video = await database_1.prisma.video.update({
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
        res.json({ success: true, message: 'Video updated successfully', data: video });
    }
    catch (error) {
        next(error);
    }
};
exports.updateVideo = updateVideo;
const deleteVideo = async (req, res, next) => {
    try {
        const videoId = req.params.id;
        const teacherId = req.user.id;
        const existingVideo = await database_1.prisma.video.findUnique({
            where: { id: videoId }
        });
        if (!existingVideo) {
            res.status(404).json({ success: false, message: 'Video not found' });
            return;
        }
        if (existingVideo.authorId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only delete your own videos' });
            return;
        }
        await database_1.prisma.video.update({
            where: { id: videoId },
            data: { isActive: false }
        });
        res.json({ success: true, message: 'Video deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteVideo = deleteVideo;
//# sourceMappingURL=videos.js.map