import { PrismaClient } from '@prisma/client';
export declare function seedIntakes(prisma: PrismaClient, courses: any[]): Promise<{
    name: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    courseId: string;
    startDate: Date;
    endDate: Date;
    amount: number | null;
}[]>;
//# sourceMappingURL=intakes.d.ts.map