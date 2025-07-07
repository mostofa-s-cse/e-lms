import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { AuthRequest } from '../types';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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

    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
      role: UserRole;
    };
    
    console.log('authenticateToken: Decoded token:', decoded);
    console.log('authenticateToken: Decoded role:', decoded.role);
    console.log('authenticateToken: Decoded role type:', typeof decoded.role);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('authenticateToken: JWT verification error:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

    // Convert both to strings for comparison to handle any type mismatches
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

export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

export const requireTeacher = requireRole([UserRole.TEACHER, UserRole.ADMIN]);
export const requireAdmin = requireRole([UserRole.ADMIN]);
export const requireStudent = requireRole([UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN]); 