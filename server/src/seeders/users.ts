import { PrismaClient, UserRole, ApprovalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('Password123', 10);

  const usersData = [
    // Admin users
    {
      email: 'admin@university.edu',
      password: hashedPassword,
      firstName: 'Ahmed',
      lastName: 'Hossain',
      role: UserRole.ADMIN,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null // Self-approved or system-approved
    },
    {
      email: 'admin2@university.edu',
      password: hashedPassword,
      firstName: 'Fatima',
      lastName: 'Rahman',
      role: UserRole.ADMIN,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null // Self-approved or system-approved
    },

    // Teacher users
    {
      email: 'prof.ali@university.edu',
      password: hashedPassword,
      firstName: 'Dr. Mohammad',
      lastName: 'Ali',
      role: UserRole.TEACHER,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'prof.ayesha@university.edu',
      password: hashedPassword,
      firstName: 'Dr. Ayesha',
      lastName: 'Begum',
      role: UserRole.TEACHER,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'prof.kamal@university.edu',
      password: hashedPassword,
      firstName: 'Prof. Kamal',
      lastName: 'Uddin',
      role: UserRole.TEACHER,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'prof.nasreen@university.edu',
      password: hashedPassword,
      firstName: 'Dr. Nasreen',
      lastName: 'Khan',
      role: UserRole.TEACHER,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'prof.rahim@university.edu',
      password: hashedPassword,
      firstName: 'Prof. Rahim',
      lastName: 'Chowdhury',
      role: UserRole.TEACHER,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },

    // Student users
    {
      email: 'student.bilal@university.edu',
      password: hashedPassword,
      firstName: 'Bilal',
      lastName: 'Ahmed',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.aisha@university.edu',
      password: hashedPassword,
      firstName: 'Aisha',
      lastName: 'Islam',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.chowdhury@university.edu',
      password: hashedPassword,
      firstName: 'Chowdhury',
      lastName: 'Zaman',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.dina@university.edu',
      password: hashedPassword,
      firstName: 'Dina',
      lastName: 'Begum',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.emon@university.edu',
      password: hashedPassword,
      firstName: 'Emon',
      lastName: 'Das',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.farhana@university.edu',
      password: hashedPassword,
      firstName: 'Farhana',
      lastName: 'Miah',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.golam@university.edu',
      password: hashedPassword,
      firstName: 'Golam',
      lastName: 'Rasul',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.habiba@university.edu',
      password: hashedPassword,
      firstName: 'Habiba',
      lastName: 'Sultana',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.imran@university.edu',
      password: hashedPassword,
      firstName: 'Imran',
      lastName: 'Haque',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.jannat@university.edu',
      password: hashedPassword,
      firstName: 'Jannat',
      lastName: 'Ferdous',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.karim@university.edu',
      password: hashedPassword,
      firstName: 'Karim',
      lastName: 'Mollah',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
        email: 'student.lamia@university.edu',
      password: hashedPassword,
      firstName: 'Lamia',
      lastName: 'Nahar',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.mahmud@university.edu',
      password: hashedPassword,
      firstName: 'Mahmud',
      lastName: 'Omar',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.nadia@university.edu',
      password: hashedPassword,
      firstName: 'Nadia',
      lastName: 'Parvin',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    {
      email: 'student.omar@university.edu',
      password: hashedPassword,
      firstName: 'Omar',
      lastName: 'Qureshi',
      role: UserRole.STUDENT,
      isActive: true,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: null
    },
    // Test pending user for admin approval testing
    {
      email: 'pending.student.aisha@university.edu',
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
      email: 'pending.teacher.ali@university.edu',
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