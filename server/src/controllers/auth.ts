import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already exists' });
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        firstName, 
        lastName, 
        role,
        approvalStatus: 'PENDING' // Default to pending approval
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
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        profile: true
      }
    });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check approval status
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
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      jwtSecret
    );
    
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
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
}; 