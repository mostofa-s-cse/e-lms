"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const database_1 = require("../utils/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getAllUsers = async (req, res, next) => {
    try {
        const { role, includeProfile } = req.query;
        const whereClause = {};
        if (role) {
            whereClause.role = role;
        }
        const selectClause = {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true
        };
        if (includeProfile === 'true') {
            selectClause.profile = {
                select: {
                    phone: true,
                    address: true,
                    city: true,
                    state: true,
                    profilePicture: true
                }
            };
        }
        const users = await database_1.prisma.user.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            select: selectClause
        });
        res.json({ success: true, message: 'Users fetched', data: users });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res, next) => {
    try {
        const { includeProfile } = req.query;
        const selectClause = {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true
        };
        if (includeProfile === 'true') {
            selectClause.profile = {
                select: {
                    phone: true,
                    address: true,
                    city: true,
                    state: true,
                    profilePicture: true
                }
            };
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: req.params.id },
            select: selectClause
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, message: 'User fetched', data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, role, profile } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        let profilePictureUrl = null;
        if (req.file) {
            profilePictureUrl = `/uploads/thumbnails/${req.file.filename}`;
        }
        const user = await database_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role
            }
        });
        let userProfile = null;
        if (profile || profilePictureUrl) {
            const profileData = profile ? JSON.parse(profile) : {};
            if (profilePictureUrl) {
                profileData.profilePicture = profilePictureUrl;
            }
            userProfile = await database_1.prisma.userProfile.create({
                data: {
                    userId: user.id,
                    ...profileData
                }
            });
        }
        const responseData = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        };
        if (userProfile) {
            responseData.profile = userProfile;
        }
        res.status(201).json({
            success: true,
            message: 'User created',
            data: responseData
        });
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ success: false, message: 'Email already exists' });
            return;
        }
        next(error);
    }
};
exports.createUser = createUser;
const updateUser = async (req, res, next) => {
    try {
        const { firstName, lastName, isActive, profile } = req.body;
        let profilePictureUrl = null;
        if (req.file) {
            profilePictureUrl = `/uploads/thumbnails/${req.file.filename}`;
        }
        const user = await database_1.prisma.user.update({
            where: { id: req.params.id },
            data: { firstName, lastName, isActive }
        });
        let userProfile = null;
        if (profile || profilePictureUrl) {
            const profileData = profile ? JSON.parse(profile) : {};
            if (profilePictureUrl) {
                profileData.profilePicture = profilePictureUrl;
            }
            const existingProfile = await database_1.prisma.userProfile.findUnique({
                where: { userId: req.params.id }
            });
            if (existingProfile) {
                userProfile = await database_1.prisma.userProfile.update({
                    where: { userId: req.params.id },
                    data: profileData
                });
            }
            else {
                userProfile = await database_1.prisma.userProfile.create({
                    data: {
                        userId: req.params.id,
                        ...profileData
                    }
                });
            }
        }
        const responseData = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        };
        if (userProfile) {
            responseData.profile = userProfile;
        }
        res.json({
            success: true,
            message: 'User updated',
            data: responseData
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        await database_1.prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'User deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
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
//# sourceMappingURL=users.js.map