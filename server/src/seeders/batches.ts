import { PrismaClient } from '@prisma/client';

export async function seedIntakes(prisma: PrismaClient, courses: any[]) {
  const currentDate = new Date();
  
  const intakesData = [
    // Fall 2024 Batches
    {
      name: 'Fall 2024 - Computer Science',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      amount: 1200.00,
      isActive: true,
      courseId: courses.find(c => c.code === 'CS101')?.id
    },
    {
      name: 'Fall 2024 - Mathematics',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      amount: 1100.00,
      isActive: true,
      courseId: courses.find(c => c.code === 'MATH201')?.id
    },
    {
      name: 'Fall 2024 - Business',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      amount: 1000.00,
      isActive: true,
      courseId: courses.find(c => c.code === 'BUS301')?.id
    },
    {
      name: 'Fall 2024 - English',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      amount: 950.00,
      isActive: true,
      courseId: courses.find(c => c.code === 'ENG201')?.id
    },
    {
      name: 'Fall 2024 - Physics',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      amount: 1300.00,
      isActive: true,
      courseId: courses.find(c => c.code === 'PHY101')?.id
    },

    // Spring 2024 Batches
    {
      name: 'Spring 2024 - Data Structures',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-01'),
      amount: 1250.00,
      isActive: false,
      courseId: courses.find(c => c.code === 'CS201')?.id
    },
    {
      name: 'Spring 2024 - Marketing',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-01'),
      amount: 1050.00,
      isActive: false,
      courseId: courses.find(c => c.code === 'MKT201')?.id
    },
    {
      name: 'Spring 2024 - Chemistry',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-01'),
      amount: 1350.00,
      isActive: false,
      courseId: courses.find(c => c.code === 'CHEM101')?.id
    },

    // Summer 2024 Batches
    {
      name: 'Summer 2024 - Web Development',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-15'),
      amount: 1400.00,
      isActive: false,
      courseId: courses.find(c => c.code === 'CS301')?.id
    },
    {
      name: 'Summer 2024 - Accounting',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-15'),
      amount: 1150.00,
      isActive: false,
      courseId: courses.find(c => c.code === 'ACC201')?.id
    },
    {
      name: 'Summer 2024 - Creative Writing',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-15'),
      amount: 900.00,
      isActive: false,
      courseId: courses.find(c => c.code === 'ENG301')?.id
    },

    // Spring 2025 Batches (Future)
    {
      name: 'Spring 2025 - Database Systems',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-05-01'),
      amount: 1500.00,
      isActive: true,
      courseId: courses.find(c => c.code === 'CS401')?.id
    },
    {
      name: 'Spring 2025 - Statistics',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-05-01'),
      amount: 1200.00,
      isActive: true,
      courseId: courses.find(c => c.code === 'MATH301')?.id
    },
    {
      name: 'Spring 2025 - HR Management',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-05-01'),
      amount: 1100.00,
      isActive: true,
      courseId: courses.find(c => c.code === 'HRM201')?.id
    },
    {
      name: 'Spring 2025 - Digital Electronics',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-05-01'),
      amount: 1600.00,
      isActive: true,
      courseId: courses.find(c => c.code === 'EE201')?.id
    }
  ];

  const batches = await Promise.all(
    intakesData.map(intakeData => 
      prisma.batch.create({
        data: intakeData
      })
    )
  );

  console.log(`✅ Created ${batches.length} batches`);
  return batches;
} 