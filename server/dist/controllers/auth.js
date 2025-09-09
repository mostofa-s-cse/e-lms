"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const database_1 = require("../utils/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;
        const existing = await database_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ success: false, message: 'Email already exists' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await database_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role,
                approvalStatus: 'PENDING'
            },
            include: {
                profile: true
            }
        });
        res.status(201).json({
            success: true,
            message: 'Registration successful! Your account is pending admin approval. You will be able to log in once an admin approves your account. If you need assistance, please contact support at contact@edulms.com.',
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isActive: user.isActive,
                approvalStatus: user.approvalStatus,
                createdAt: user.createdAt,
                profile: user.profile ? {
                    phone: user.profile.phone,
                    address: user.profile.address,
                    city: user.profile.city,
                    state: user.profile.state,
                    profilePicture: user.profile.profilePicture
                } : null
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await database_1.prisma.user.findUnique({
            where: { email },
            include: {
                profile: true
            }
        });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        if (user.approvalStatus === 'PENDING') {
            res.status(403).json({
                success: false,
                message: 'Your registration request is pending admin approval. Please wait for approval or contact support at contact@edulms.com for assistance.'
            });
            return;
        }
        if (user.approvalStatus === 'REJECTED') {
            res.status(403).json({
                success: false,
                message: 'Your account has been rejected by admin. Please contact support at contact@edulms.com for more information.'
            });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            res.status(500).json({ success: false, message: 'JWT secret not configured' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret);
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    profile: user.profile ? {
                        phone: user.profile.phone,
                        address: user.profile.address,
                        city: user.profile.city,
                        state: user.profile.state,
                        profilePicture: user.profile.profilePicture
                    } : null
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
//# sourceMappingURL=auth.js.map