import { PrismaClient } from '@prisma/client';
export declare function seedEnrollments(prisma: PrismaClient, users: any[], courses: any[], intakes: any[]): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    enrolledAt: Date;
    status: import(".prisma/client").$Enums.EnrollmentStatus;
    studentId: string;
    courseId: string;
    intakeId: string;
}[]>;
//# sourceMappingURL=enrollments.d.ts.map