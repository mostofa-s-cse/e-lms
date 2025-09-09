"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStudent = exports.requireAdmin = exports.requireTeacher = exports.authorizeRoles = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('authenticateToken: Auth header:', authHeader);
    console.log('authenticateToken: Token:', token ? 'exists' : 'missing');
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access token required'
        });
        return;
    }
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            res.status(500).json({
                success: false,
                message: 'JWT secret not configured'
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        console.log('authenticateToken: Decoded token:', decoded);
        console.log('authenticateToken: Decoded role:', decoded.role);
        console.log('authenticateToken: Decoded role type:', typeof decoded.role);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('authenticateToken: JWT verification error:', error);
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        console.log('requireRole: Checking roles:', roles);
        console.log('requireRole: User:', req.user);
        console.log('requireRole: User role:', req.user?.role);
        console.log('requireRole: User role type:', typeof req.user?.role);
        console.log('requireRole: Roles array:', roles);
        console.log('requireRole: Roles array types:', roles.map(r => typeof r));
        if (!req.user) {
            console.log('requireRole: No user found - authentication required');
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const userRoleString = String(req.user.role);
        const rolesStrings = roles.map(r => String(r));
        console.log('requireRole: User role string:', userRoleString);
        console.log('requireRole: Required roles strings:', rolesStrings);
        console.log('requireRole: Includes check:', rolesStrings.includes(userRoleString));
        if (!rolesStrings.includes(userRoleString)) {
            console.log('requireRole: Insufficient permissions - user role:', req.user.role, 'required roles:', roles);
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }
        console.log('requireRole: Access granted for role:', req.user.role);
        next();
    };
};
exports.requireRole = requireRole;
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
exports.requireTeacher = (0, exports.requireRole)([client_1.UserRole.TEACHER, client_1.UserRole.ADMIN]);
exports.requireAdmin = (0, exports.requireRole)([client_1.UserRole.ADMIN]);
exports.requireStudent = (0, exports.requireRole)([client_1.UserRole.STUDENT, client_1.UserRole.TEACHER, client_1.UserRole.ADMIN]);
//# sourceMappingURL=auth.js.map