import { PrismaClient } from '@prisma/client';
export declare function seedCourses(prisma: PrismaClient, users: any[]): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string;
    code: string;
    credits: number;
    price: number | null;
    isFree: boolean;
    thumbnail: string | null;
    teacherId: string;
}[]>;
//# sourceMappingURL=courses.d.ts.map