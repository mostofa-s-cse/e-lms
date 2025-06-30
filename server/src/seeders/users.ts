import { PrismaClient, UserRole } from '@prisma/client';
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
      isActive: true
    },
    {
      email: 'admin2@university.edu',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Director',
      role: UserRole.ADMIN,
      isActive: true
    },

    // Teacher users
    {
      email: 'prof.smith@university.edu',
      password: hashedPassword,
      firstName: 'Dr. Michael',
      lastName: 'Smith',
      role: UserRole.TEACHER,
      isActive: true
    },
    {
      email: 'prof.johnson@university.edu',
      password: hashedPassword,
      firstName: 'Dr. Emily',
      lastName: 'Johnson',
      role: UserRole.TEACHER,
      isActive: true
    },
    {
      email: 'prof.williams@university.edu',
      password: hashedPassword,
      firstName: 'Prof. David',
      lastName: 'Williams',
      role: UserRole.TEACHER,
      isActive: true
    },
    {
      email: 'prof.brown@university.edu',
      password: hashedPassword,
      firstName: 'Dr. Lisa',
      lastName: 'Brown',
      role: UserRole.TEACHER,
      isActive: true
    },
    {
      email: 'prof.davis@university.edu',
      password: hashedPassword,
      firstName: 'Prof. Robert',
      lastName: 'Davis',
      role: UserRole.TEACHER,
      isActive: true
    },

    // Student users
    {
      email: 'student1@university.edu',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student2@university.edu',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Smith',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student3@university.edu',
      password: hashedPassword,
      firstName: 'Carol',
      lastName: 'Williams',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student4@university.edu',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Brown',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student5@university.edu',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'Davis',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student6@university.edu',
      password: hashedPassword,
      firstName: 'Frank',
      lastName: 'Miller',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student7@university.edu',
      password: hashedPassword,
      firstName: 'Grace',
      lastName: 'Wilson',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student8@university.edu',
      password: hashedPassword,
      firstName: 'Henry',
      lastName: 'Taylor',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student9@university.edu',
      password: hashedPassword,
      firstName: 'Ivy',
      lastName: 'Anderson',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student10@university.edu',
      password: hashedPassword,
      firstName: 'Jack',
      lastName: 'Thomas',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student11@university.edu',
      password: hashedPassword,
      firstName: 'Kate',
      lastName: 'Jackson',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student12@university.edu',
      password: hashedPassword,
      firstName: 'Liam',
      lastName: 'White',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student13@university.edu',
      password: hashedPassword,
      firstName: 'Mia',
      lastName: 'Harris',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student14@university.edu',
      password: hashedPassword,
      firstName: 'Noah',
      lastName: 'Martin',
      role: UserRole.STUDENT,
      isActive: true
    },
    {
      email: 'student15@university.edu',
      password: hashedPassword,
      firstName: 'Olivia',
      lastName: 'Thompson',
      role: UserRole.STUDENT,
      isActive: true
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