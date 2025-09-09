import { PrismaClient } from '@prisma/client';
export declare function seedIntakes(prisma: PrismaClient, courses: any[]): Promise<{
    name: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    courseId: string;
    amount: number | null;
    startDate: Date;
    endDate: Date;
}[]>;
//# sourceMappingURL=intakes.d.ts.map