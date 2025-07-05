"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseEnrollments = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourseById = exports.getAllCourses = void 0;
const database_1 = require("../utils/database");
const getAllCourses = async (req, res, next) => {
    try {
        const courses = await database_1.prisma.course.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            include: {
                teacher: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                _count: {
                    select: { enrollments: true, notes: true, videos: true, quizzes: true }
                }
            }
        });
        res.json({ success: true, message: 'Courses fetched successfully', data: courses });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCourses = getAllCourses;
const getCourseById = async (req, res, next) => {
    try {
        const course = await database_1.prisma.course.findUnique({
            where: { id: req.params.id },
            include: {
                teacher: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                intakes: {
                    where: { isActive: true },
                    orderBy: { startDate: 'desc' }
                },
                _count: {
                    select: { enrollments: true, notes: true, videos: true, quizzes: true }
                }
            }
        });
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }
        res.json({ success: true, message: 'Course fetched successfully', data: course });
    }
    catch (error) {
        next(error);
    }
};
exports.getCourseById = getCourseById;
const createCourse = async (req, res, next) => {
    try {
        const { title, description, code, credits, price, isFree, teacherId } = req.body;
        let finalTeacherId;
        if (req.user.role === 'ADMIN' && teacherId) {
            finalTeacherId = teacherId;
        }
        else {
            finalTeacherId = req.user.id;
        }
        let thumbnail = null;
        if (req.file) {
            thumbnail = `/uploads/thumbnails/${req.file.filename}`;
        }
        else {
            thumbnail = null;
        }
        const courseData = {
            title,
            description,
            code,
            credits: credits ? parseInt(credits) : 0,
            price: price ? parseFloat(price) : 0.0,
            isFree: isFree === 'true' || isFree === true,
            thumbnail,
            teacherId: finalTeacherId
        };
        const course = await database_1.prisma.course.create({
            data: courseData,
            include: {
                teacher: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            }
        });
        res.status(201).json({ success: true, message: 'Course created successfully', data: course });
    }
    catch (error) {
        console.error('Error creating course:', error);
        if (error.code === 'P2002') {
            res.status(409).json({ success: false, message: 'Course code already exists' });
            return;
        }
        next(error);
    }
};
exports.createCourse = createCourse;
const updateCourse = async (req, res, next) => {
    try {
        const { title, description, code, credits, isActive, price, isFree, teacherId } = req.body;
        const courseId = req.params.id;
        const currentUserId = req.user.id;
        const existingCourse = await database_1.prisma.course.findUnique({
            where: { id: courseId }
        });
        if (!existingCourse) {
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }
        if (existingCourse.teacherId !== currentUserId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only update your own courses' });
            return;
        }
        let thumbnail = undefined;
        if (req.file) {
            thumbnail = `/uploads/thumbnails/${req.file.filename}`;
        }
        const updateData = {
            title,
            description,
            code,
            credits: credits ? parseInt(credits) : undefined,
            isActive: isActive !== undefined ? isActive === 'true' || isActive === true : undefined,
            price: price !== undefined ? parseFloat(price) : undefined,
            isFree: isFree !== undefined ? (isFree === 'true' || isFree === true) : undefined,
            thumbnail: thumbnail !== undefined ? thumbnail : undefined
        };
        if (req.user.role === 'ADMIN' && teacherId) {
            updateData.teacherId = teacherId;
        }
        const course = await database_1.prisma.course.update({
            where: { id: courseId },
            data: updateData,
            include: {
                teacher: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            }
        });
        res.json({ success: true, message: 'Course updated successfully', data: course });
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ success: false, message: 'Course code already exists' });
            return;
        }
        next(error);
    }
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const teacherId = req.user.id;
        const existingCourse = await database_1.prisma.course.findUnique({
            where: { id: courseId }
        });
        if (!existingCourse) {
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }
        if (existingCourse.teacherId !== teacherId && req.user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'You can only delete your own courses' });
            return;
        }
        await database_1.prisma.course.update({
            where: { id: courseId },
            data: { isActive: false }
        });
        res.json({ success: true, message: 'Course deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCourse = deleteCourse;
const getCourseEnrollments = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const enrollments = await database_1.prisma.enrollment.findMany({
            where: { courseId },
            include: {
                student: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                intake: {
                    select: { id: true, name: true, startDate: true, endDate: true }
                }
            },
            orderBy: { enrolledAt: 'desc' }
        });
        res.json({ success: true, message: 'Course enrollments fetched successfully', data: enrollments });
    }
    catch (error) {
        next(error);
    }
};
exports.getCourseEnrollments = getCourseEnrollments;
//# sourceMappingURL=courses.js.map