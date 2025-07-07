import { Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { ApiResponse, AuthRequest } from '../types';
import bcrypt from 'bcryptjs';
import path from 'path';

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, includeProfile } = req.query;
    
    const whereClause: any = {};
    if (role) {
      whereClause.role = role as string;
    }
    
    const selectClause: any = { 
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
    
    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: selectClause
    });
    res.json({ success: true, message: 'Users fetched', data: users } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getTeachers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teachers = await prisma.user.findMany({
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
        createdAt: true 
      },
      orderBy: { firstName: 'asc' }
    });
    res.json({ success: true, message: 'Teachers fetched', data: teachers } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const students = await prisma.user.findMany({
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
        createdAt: true 
      },
      orderBy: { firstName: 'asc' }
    });
    res.json({ success: true, message: 'Students fetched', data: students } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { includeProfile } = req.query;
    
    const selectClause: any = { 
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

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: selectClause
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

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, profile, isActive } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const parsedIsActive = isActive === 'true';
    // Handle profile picture upload
    let profilePictureUrl = null;
    if (req.file) {
      profilePictureUrl = `/uploads/profile/${req.file.filename}`;
    }
    
    // Create user first
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        firstName, 
        lastName, 
        role,
        isActive: parsedIsActive
      }
    });

    // If profile data is provided, create profile separately
    let userProfile = null;
    if (profile || profilePictureUrl) {
      const profileData = profile ? JSON.parse(profile) : {};
      if (profilePictureUrl) {
        profileData.profilePicture = profilePictureUrl;
      }
      
      userProfile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          ...profileData
        }
      });
    }

    const responseData: any = { 
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
    } as ApiResponse);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Email already exists' });
      return;
    }
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, isActive, profile } = req.body;
    const parsedIsActive = isActive === 'true';
    // Handle profile picture upload
    let profilePictureUrl = null;
    if (req.file) {
      profilePictureUrl = `/uploads/profile/${req.file.filename}`;
    }
    
    // Update user data
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, isActive: parsedIsActive }
    });

    // Update or create profile if provided
    let userProfile = null;
    if (profile || profilePictureUrl) {
      const profileData = profile ? JSON.parse(profile) : {};
      if (profilePictureUrl) {
        profileData.profilePicture = profilePictureUrl;
      }
      
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId: req.params.id }
      });

      if (existingProfile) {
        userProfile = await prisma.userProfile.update({
          where: { userId: req.params.id },
          data: profileData
        });
      } else {
        userProfile = await prisma.userProfile.create({
          data: {
            userId: req.params.id,
            ...profileData
          }
        });
      }
    }

    const responseData: any = { 
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
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

// Profile-specific methods
export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    const profile = await prisma.userProfile.findUnique({
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

    res.json({ success: true, message: 'User profile fetched', data: profile } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.id;
    const { firstName, lastName, email, phone, address, city, state, profile } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    // Handle profile picture upload
    let profilePictureUrl = null;
    if (req.file) {
      profilePictureUrl = `/uploads/profile/${req.file.filename}`;
    }

    // Update user data if provided
    let updatedUser = null;
    if (firstName || lastName || email) {
      const userUpdateData: any = {};
      if (firstName) userUpdateData.firstName = firstName;
      if (lastName) userUpdateData.lastName = lastName;
      if (email) userUpdateData.email = email;

      updatedUser = await prisma.user.update({
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

    // Handle profile data
    let userProfile = null;
    const profileData = profile ? JSON.parse(profile) : {};
    
    // Add profile picture if uploaded
    if (profilePictureUrl) {
      profileData.profilePicture = profilePictureUrl;
    }

    // Add direct profile fields if provided
    if (phone) profileData.phone = phone;
    if (address) profileData.address = address;
    if (city) profileData.city = city;
    if (state) profileData.state = state;

    if (Object.keys(profileData).length > 0) {
      // Try to update profile, if not found, create
      try {
        userProfile = await prisma.userProfile.update({
          where: { userId },
          data: profileData
        });
      } catch (error: any) {
        if (error.code === 'P2025') {
          // Not found, create it
          userProfile = await prisma.userProfile.create({
            data: {
              userId,
              ...profileData
            }
          });
        } else {
          throw error;
        }
      }
    }

    // Prepare response data
    let responseData: any = updatedUser;
    
    // If no user update was performed, fetch current user data
    if (!responseData) {
      const currentUser = await prisma.user.findUnique({
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
    } as ApiResponse);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Email already exists' });
      return;
    }
    next(error);
  }
}; 