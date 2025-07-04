import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse } from '../types';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.query;
    
    const whereClause: any = {};
    if (role) {
      whereClause.role = role as string;
    }
    
    const users = await prisma.user.findMany({
      where: whereClause,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true }
    });
    res.json({ success: true, message: 'Users fetched', data: users } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true }
    });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, message: 'User fetched', data: user } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, role }
    });
    res.status(201).json({ 
      success: true, 
      message: 'User created', 
      data: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role 
      } 
    } as ApiResponse);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Email already exists' });
      return;
    }
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, isActive }
    });
    res.json({ 
      success: true, 
      message: 'User updated', 
      data: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role 
      } 
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' } as ApiResponse);
  } catch (error) {
    next(error);
  }
}; 