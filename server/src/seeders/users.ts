import { PrismaClient, UserRole, ApprovalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usersData = [
    // Admin users
    {
      email: 'admin@university.edu',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null // Self-approved or system-approved
    },
    {
      email: 'admin2@university.edu',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Director',
      role: UserRole.ADMIN,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null // Self-approved or system-approved
    },

    // Teacher users
    {
      email: 'prof.smith@university.edu',
      password: hashedPassword,
      firstName: 'Dr. Michael',
      lastName: 'Smith',
      role: UserRole.TEACHER,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'prof.johnson@university.edu',
      password: hashedPassword,
      firstName: 'Dr. Emily',
      lastName: 'Johnson',
      role: UserRole.TEACHER,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'prof.williams@university.edu',
      password: hashedPassword,
      firstName: 'Prof. David',
      lastName: 'Williams',
      role: UserRole.TEACHER,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'prof.brown@university.edu',
      password: hashedPassword,
      firstName: 'Dr. Lisa',
      lastName: 'Brown',
      role: UserRole.TEACHER,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'prof.davis@university.edu',
      password: hashedPassword,
      firstName: 'Prof. Robert',
      lastName: 'Davis',
      role: UserRole.TEACHER,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },

    // Student users
    {
      email: 'student1@university.edu',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student2@university.edu',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Smith',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student3@university.edu',
      password: hashedPassword,
      firstName: 'Carol',
      lastName: 'Williams',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student4@university.edu',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Brown',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student5@university.edu',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'Davis',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student6@university.edu',
      password: hashedPassword,
      firstName: 'Frank',
      lastName: 'Miller',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student7@university.edu',
      password: hashedPassword,
      firstName: 'Grace',
      lastName: 'Wilson',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student8@university.edu',
      password: hashedPassword,
      firstName: 'Henry',
      lastName: 'Taylor',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student9@university.edu',
      password: hashedPassword,
      firstName: 'Ivy',
      lastName: 'Anderson',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student10@university.edu',
      password: hashedPassword,
      firstName: 'Jack',
      lastName: 'Thomas',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student11@university.edu',
      password: hashedPassword,
      firstName: 'Kate',
      lastName: 'Jackson',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student12@university.edu',
      password: hashedPassword,
      firstName: 'Liam',
      lastName: 'White',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student13@university.edu',
      password: hashedPassword,
      firstName: 'Mia',
      lastName: 'Harris',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student14@university.edu',
      password: hashedPassword,
      firstName: 'Noah',
      lastName: 'Martin',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student15@university.edu',
      password: hashedPassword,
      firstName: 'Olivia',
      lastName: 'Thompson',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    // Test pending user for admin approval testing
    {
      email: 'pending.student@university.edu',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'PendingStudent',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.PENDING,
      approvedAt: null,
      approvedBy: null
    },
    {
      email: 'pending.teacher@university.edu',
      password: hashedPassword,
      firstName: 'Dr. Test',
      lastName: 'PendingTeacher',
      role: UserRole.TEACHER,
      isActive: true,
      approvalStatus: ApprovalStatus.PENDING,
      approvedAt: null,
      approvedBy: null
    }
  ];

  const users = await Promise.all(
    usersData.map(userData => 
      prisma.user.create({
        data: userData
      })
    )
  );

  console.log(`✅ Created ${users.length} users`);
  return users;
} 