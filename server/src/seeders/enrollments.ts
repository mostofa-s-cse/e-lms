import { PrismaClient, UserRole, EnrollmentStatus } from '@prisma/client';

export async function seedEnrollments(prisma: PrismaClient, users: any[], courses: any[], intakes: any[]) {
  const students = users.filter(user => user.role === UserRole.STUDENT);
  
  const enrollmentsData = [
    // Computer Science Enrollments
    {
      studentId: students[0].id,
      courseId: courses.find(c => c.code === 'CS101')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Computer Science'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[1].id,
      courseId: courses.find(c => c.code === 'CS101')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Computer Science'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[2].id,
      courseId: courses.find(c => c.code === 'CS101')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Computer Science'))?.id,
      status: EnrollmentStatus.ACTIVE
    },

    // Mathematics Enrollments
    {
      studentId: students[3].id,
      courseId: courses.find(c => c.code === 'MATH201')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Mathematics'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[4].id,
      courseId: courses.find(c => c.code === 'MATH201')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Mathematics'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[5].id,
      courseId: courses.find(c => c.code === 'MATH201')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Mathematics'))?.id,
      status: EnrollmentStatus.ACTIVE
    },

    // Business Management Enrollments
    {
      studentId: students[6].id,
      courseId: courses.find(c => c.code === 'BUS301')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Business'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[7].id,
      courseId: courses.find(c => c.code === 'BUS301')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Business'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[8].id,
      courseId: courses.find(c => c.code === 'BUS301')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Business'))?.id,
      status: EnrollmentStatus.ACTIVE
    },

    // English Literature Enrollments
    {
      studentId: students[9].id,
      courseId: courses.find(c => c.code === 'ENG201')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - English'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[10].id,
      courseId: courses.find(c => c.code === 'ENG201')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - English'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[11].id,
      courseId: courses.find(c => c.code === 'ENG201')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - English'))?.id,
      status: EnrollmentStatus.ACTIVE
    },

    // Physics Enrollments
    {
      studentId: students[12].id,
      courseId: courses.find(c => c.code === 'PHY101')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Physics'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[13].id,
      courseId: courses.find(c => c.code === 'PHY101')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Physics'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[14].id,
      courseId: courses.find(c => c.code === 'PHY101')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Physics'))?.id,
      status: EnrollmentStatus.ACTIVE
    },

    // Multiple Course Enrollments (Some students taking multiple courses)
    {
      studentId: students[0].id,
      courseId: courses.find(c => c.code === 'MATH201')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Mathematics'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[1].id,
      courseId: courses.find(c => c.code === 'BUS301')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - Business'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[2].id,
      courseId: courses.find(c => c.code === 'ENG201')?.id,
      intakeId: intakes.find(i => i.name.includes('Fall 2024 - English'))?.id,
      status: EnrollmentStatus.ACTIVE
    },

    // Future Spring 2025 Enrollments
    {
      studentId: students[3].id,
      courseId: courses.find(c => c.code === 'CS401')?.id,
      intakeId: intakes.find(i => i.name.includes('Spring 2025 - Database Systems'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[4].id,
      courseId: courses.find(c => c.code === 'MATH301')?.id,
      intakeId: intakes.find(i => i.name.includes('Spring 2025 - Statistics'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[5].id,
      courseId: courses.find(c => c.code === 'HRM201')?.id,
      intakeId: intakes.find(i => i.name.includes('Spring 2025 - HR Management'))?.id,
      status: EnrollmentStatus.ACTIVE
    },
    {
      studentId: students[6].id,
      courseId: courses.find(c => c.code === 'EE201')?.id,
      intakeId: intakes.find(i => i.name.includes('Spring 2025 - Digital Electronics'))?.id,
      status: EnrollmentStatus.ACTIVE
    },

    // Some completed enrollments
    {
      studentId: students[7].id,
      courseId: courses.find(c => c.code === 'CS201')?.id,
      intakeId: intakes.find(i => i.name.includes('Spring 2024 - Data Structures'))?.id,
      status: EnrollmentStatus.COMPLETED
    },
    {
      studentId: students[8].id,
      courseId: courses.find(c => c.code === 'MKT201')?.id,
      intakeId: intakes.find(i => i.name.includes('Spring 2024 - Marketing'))?.id,
      status: EnrollmentStatus.COMPLETED
    },

    // Some dropped enrollments
    {
      studentId: students[9].id,
      courseId: courses.find(c => c.code === 'CHEM101')?.id,
      intakeId: intakes.find(i => i.name.includes('Spring 2024 - Chemistry'))?.id,
      status: EnrollmentStatus.DROPPED
    }
  ];

  const enrollments = await Promise.all(
    enrollmentsData.map(enrollmentData => 
      prisma.enrollment.create({
        data: enrollmentData
      })
    )
  );

  console.log(`✅ Created ${enrollments.length} enrollments`);
  return enrollments;
} 