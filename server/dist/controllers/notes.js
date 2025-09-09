"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNoteStats = exports.deleteNote = exports.updateNote = exports.createNote = exports.getNoteById = exports.getNotesByCourse = exports.getNotesByTeacher = exports.getAllNotes = void 0;
const database_1 = require("../utils/database");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getAllNotes = async (req, res, next) => {
    try {
        const { courseId, authorId, isImage } = req.query;
        const whereClause = { isActive: true };
        if (courseId) {
            whereClause.courseId = courseId;
        }
        if (authorId) {
            whereClause.authorId = authorId;
        }
        if (isImage !== undefined) {
            whereClause.isImage = isImage === 'true';
        }
        const notes = await database_1.prisma.note.findMany({
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
        res.json({ success: true, message: 'Notes fetched successfully', data: notes });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllNotes = getAllNotes;
const getNotesByTeacher = async (req, res, next) => {
    try {
        const teacherId = req.user.id;
        const notes = await database_1.prisma.note.findMany({
            where: {
                authorId: teacherId,
                isActive: true
            },
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
        res.json({ success: true, message: 'Teacher notes fetched successfully', data: notes });
    }
    catch (error) {
        next(error);
    }
};
exports.getNotesByTeacher = getNotesByTeacher;
const getNotesByCourse = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const notes = await database_1.prisma.note.findMany({
            where: {
                courseId,
                isActive: true
            },
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
        res.json({ success: true, message: 'Course notes fetched successfully', data: notes });
    }
    catch (error) {
        next(error);
    }
};
exports.getNotesByCourse = getNotesByCourse;
const getNoteById = async (req, res, next) => {
    try {
        const note = await database_1.prisma.note.findUnique({
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
        res.json({ success: true, message: 'Note fetched successfully', data: note });
    }
    catch (error) {
        next(error);
    }
};
exports.getNoteById = getNoteById;
const createNote = async (req, res, next) => {
    try {
        const { title, description, courseId } = req.body;
        const teacherId = req.user.id;
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
        const course = await database_1.prisma.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }
        if (course.teacherId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only create notes for your own courses' });
            return;
        }
        const isImage = req.file.mimetype.startsWith('image/');
        const maxFileSize = 10 * 1024 * 1024;
        if (req.file.size > maxFileSize) {
            res.status(400).json({ success: false, message: 'File size too large. Maximum allowed size is 10MB.' });
            return;
        }
        const note = await database_1.prisma.note.create({
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
        res.status(201).json({ success: true, message: 'Note created successfully', data: note });
    }
    catch (error) {
        next(error);
    }
};
exports.createNote = createNote;
const updateNote = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const noteId = req.params.id;
        const teacherId = req.user.id;
        if (!title || !title.trim()) {
            res.status(400).json({ success: false, message: 'Title is required' });
            return;
        }
        const existingNote = await database_1.prisma.note.findUnique({
            where: { id: noteId },
            include: {
                course: true
            }
        });
        if (!existingNote) {
            res.status(404).json({ success: false, message: 'Note not found' });
            return;
        }
        if (existingNote.authorId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only update your own notes' });
            return;
        }
        const updateData = {
            title: title.trim(),
            description: description?.trim() || null
        };
        if (req.file) {
            const maxFileSize = 10 * 1024 * 1024;
            if (req.file.size > maxFileSize) {
                res.status(400).json({ success: false, message: 'File size too large. Maximum allowed size is 10MB.' });
                return;
            }
            if (existingNote.attachment) {
                const oldFilePath = path_1.default.join(__dirname, '..', '..', existingNote.attachment);
                if (fs_1.default.existsSync(oldFilePath)) {
                    fs_1.default.unlinkSync(oldFilePath);
                }
            }
            const isImage = req.file.mimetype.startsWith('image/');
            updateData.attachment = `/uploads/notes/${req.file.filename}`;
            updateData.attachmentSize = req.file.size;
            updateData.attachmentType = req.file.mimetype;
            updateData.isImage = isImage;
        }
        const note = await database_1.prisma.note.update({
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
        res.json({ success: true, message: 'Note updated successfully', data: note });
    }
    catch (error) {
        next(error);
    }
};
exports.updateNote = updateNote;
const deleteNote = async (req, res, next) => {
    try {
        const noteId = req.params.id;
        const teacherId = req.user.id;
        const existingNote = await database_1.prisma.note.findUnique({
            where: { id: noteId }
        });
        if (!existingNote) {
            res.status(404).json({ success: false, message: 'Note not found' });
            return;
        }
        if (existingNote.authorId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only delete your own notes' });
            return;
        }
        if (existingNote.attachment) {
            const filePath = path_1.default.join(__dirname, '..', '..', existingNote.attachment);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        await database_1.prisma.note.update({
            where: { id: noteId },
            data: { isActive: false }
        });
        res.json({ success: true, message: 'Note deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNote = deleteNote;
const getNoteStats = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        const whereClause = { isActive: true };
        if (courseId) {
            whereClause.courseId = courseId;
        }
        const [totalNotes, imageNotes, documentNotes, totalSize] = await Promise.all([
            database_1.prisma.note.count({ where: whereClause }),
            database_1.prisma.note.count({ where: { ...whereClause, isImage: true } }),
            database_1.prisma.note.count({ where: { ...whereClause, isImage: false } }),
            database_1.prisma.note.aggregate({
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
        res.json({ success: true, message: 'Note statistics fetched successfully', data: stats });
    }
    catch (error) {
        next(error);
    }
};
exports.getNoteStats = getNoteStats;
//# sourceMappingURL=notes.js.map