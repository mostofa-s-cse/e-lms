"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.updateUserApproval = exports.getPendingApprovals = exports.getUserProfile = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getStudents = exports.getTeachers = exports.getAllUsers = void 0;
const database_1 = require("../utils/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
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
            approvalStatus: true,
            approvedAt: true,
            approvedBy: true,
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
const getTeachers = async (req, res, next) => {
    try {
        const teachers = await database_1.prisma.user.findMany({
            where: {
                role: 'TEACHER',
                isActive: true
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                approvalStatus: true,
                approvedAt: true,
                approvedBy: true,
                createdAt: true
            },
            orderBy: { firstName: 'asc' }
        });
        res.json({ success: true, message: 'Teachers fetched', data: teachers });
    }
    catch (error) {
        next(error);
    }
};
exports.getTeachers = getTeachers;
const getStudents = async (req, res, next) => {
    try {
        const students = await database_1.prisma.user.findMany({
            where: {
                role: 'STUDENT',
                isActive: true
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                approvalStatus: true,
                approvedAt: true,
                approvedBy: true,
                createdAt: true
            },
            orderBy: { firstName: 'asc' }
        });
        res.json({ success: true, message: 'Students fetched', data: students });
    }
    catch (error) {
        next(error);
    }
};
exports.getStudents = getStudents;
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
            approvalStatus: true,
            approvedAt: true,
            approvedBy: true,
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
        const { email, password, firstName, lastName, role, profile, isActive } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const parsedIsActive = isActive === 'true';
        let profilePictureUrl = null;
        if (req.file) {
            profilePictureUrl = `/uploads/profile/${req.file.filename}`;
        }
        const user = await database_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role,
                isActive: parsedIsActive
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
        const parsedIsActive = isActive === 'true';
        let profilePictureUrl = null;
        if (req.file) {
            profilePictureUrl = `/uploads/profile/${req.file.filename}`;
        }
        const user = await database_1.prisma.user.update({
            where: { id: req.params.id },
            data: { firstName, lastName, isActive: parsedIsActive }
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
const getPendingApprovals = async (req, res, next) => {
    try {
        const pendingUsers = await database_1.prisma.user.findMany({
            where: { approvalStatus: client_1.ApprovalStatus.PENDING },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                profile: {
                    select: {
                        phone: true,
                        address: true,
                        city: true,
                        state: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json({
            success: true,
            message: 'Pending approvals fetched',
            data: pendingUsers
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPendingApprovals = getPendingApprovals;
const updateUserApproval = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { approvalStatus, rejectionReason } = req.body;
        const adminId = req.user?.id;
        if (!['APPROVED', 'REJECTED'].includes(approvalStatus)) {
            res.status(400).json({ success: false, message: 'Invalid approval status' });
            return;
        }
        const user = await database_1.prisma.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (user.approvalStatus !== 'PENDING') {
            res.status(400).json({ success: false, message: 'User is not pending approval' });
            return;
        }
        const updateData = {
            approvalStatus,
            approvedAt: new Date(),
            approvedBy: adminId
        };
        if (approvalStatus === 'REJECTED' && rejectionReason) {
        }
        const updatedUser = await database_1.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                profile: true
            }
        });
        res.json({
            success: true,
            message: `User ${approvalStatus.toLowerCase()} successfully`,
            data: updatedUser
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserApproval = updateUserApproval;
const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.user?.id;
        const { firstName, lastName, email, phone, address, city, state, profile } = req.body;
        if (!userId) {
            res.status(400).json({ success: false, message: 'User ID is required' });
            return;
        }
        let profilePictureUrl = null;
        if (req.file) {
            profilePictureUrl = `/uploads/profile/${req.file.filename}`;
        }
        let updatedUser = null;
        if (firstName || lastName || email) {
            const userUpdateData = {};
            if (firstName)
                userUpdateData.firstName = firstName;
            if (lastName)
                userUpdateData.lastName = lastName;
            if (email)
                userUpdateData.email = email;
            updatedUser = await database_1.prisma.user.update({
                where: { id: userId },
                data: userUpdateData,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    createdAt: true
                }
            });
        }
        let userProfile = null;
        const profileData = profile ? JSON.parse(profile) : {};
        if (profilePictureUrl) {
            profileData.profilePicture = profilePictureUrl;
        }
        if (phone)
            profileData.phone = phone;
        if (address)
            profileData.address = address;
        if (city)
            profileData.city = city;
        if (state)
            profileData.state = state;
        if (Object.keys(profileData).length > 0) {
            try {
                userProfile = await database_1.prisma.userProfile.update({
                    where: { userId },
                    data: profileData
                });
            }
            catch (error) {
                if (error.code === 'P2025') {
                    userProfile = await database_1.prisma.userProfile.create({
                        data: {
                            userId,
                            ...profileData
                        }
                    });
                }
                else {
                    throw error;
                }
            }
        }
        let responseData = updatedUser;
        if (!responseData) {
            const currentUser = await database_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    createdAt: true
                }
            });
            if (currentUser) {
                responseData = currentUser;
            }
        }
        if (userProfile) {
            responseData.profile = userProfile;
        }
        res.json({
            success: true,
            message: 'User profile updated',
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
exports.updateUserProfile = updateUserProfile;
//# sourceMappingURL=users.js.map