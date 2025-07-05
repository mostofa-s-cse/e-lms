"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUserProfiles = exports.deleteUserProfile = exports.updateUserProfile = exports.createUserProfile = exports.getUserProfile = void 0;
const database_1 = require("../utils/database");
const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.user?.id;
        if (!userId) {
            res.status(400).json({ success: false, message: 'User ID is required' });
            return;
        }
        const profile = await database_1.prisma.userProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        isActive: true
                    }
                }
            }
        });
        if (!profile) {
            res.status(404).json({ success: false, message: 'User profile not found' });
            return;
        }
        res.json({ success: true, message: 'User profile fetched', data: profile });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserProfile = getUserProfile;
const createUserProfile = async (req, res, next) => {
    try {
        const { userId, phone, address, city, state, profilePicture } = req.body;
        const existingProfile = await database_1.prisma.userProfile.findUnique({
            where: { userId }
        });
        if (existingProfile) {
            res.status(409).json({ success: false, message: 'User profile already exists' });
            return;
        }
        const profile = await database_1.prisma.userProfile.create({
            data: {
                userId,
                phone,
                address,
                city,
                state,
                profilePicture
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'User profile created',
            data: profile
        });
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ success: false, message: 'User profile already exists' });
            return;
        }
        next(error);
    }
};
exports.createUserProfile = createUserProfile;
const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.user?.id;
        const { phone, address, city, state, profilePicture } = req.body;
        if (!userId) {
            res.status(400).json({ success: false, message: 'User ID is required' });
            return;
        }
        const profile = await database_1.prisma.userProfile.update({
            where: { userId },
            data: {
                phone,
                address,
                city,
                state,
                profilePicture
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true
                    }
                }
            }
        });
        res.json({
            success: true,
            message: 'User profile updated',
            data: profile
        });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ success: false, message: 'User profile not found' });
            return;
        }
        next(error);
    }
};
exports.updateUserProfile = updateUserProfile;
const deleteUserProfile = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        await database_1.prisma.userProfile.delete({
            where: { userId }
        });
        res.json({ success: true, message: 'User profile deleted' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ success: false, message: 'User profile not found' });
            return;
        }
        next(error);
    }
};
exports.deleteUserProfile = deleteUserProfile;
const getAllUserProfiles = async (req, res, next) => {
    try {
        const profiles = await database_1.prisma.userProfile.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        isActive: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            message: 'User profiles fetched',
            data: profiles
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUserProfiles = getAllUserProfiles;
//# sourceMappingURL=userProfiles.js.map