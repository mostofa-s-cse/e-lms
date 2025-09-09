import { PrismaClient } from '@prisma/client';
export declare function seedEnrollments(prisma: PrismaClient, users: any[], courses: any[], intakes: any[]): Promise<{
    id: string;
    approvedAt: Date | null;
    approvedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    enrolledAt: Date;
    status: import(".prisma/client").$Enums.EnrollmentStatus;
    rejectedAt: Date | null;
    rejectionReason: string | null;
    studentId: string;
    courseId: string;
    intakeId: string | null;
}[]>;
//# sourceMappingURL=enrollments.d.ts.map