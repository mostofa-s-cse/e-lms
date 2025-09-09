import { PrismaClient } from '@prisma/client';
export declare function seedQuizzes(prisma: PrismaClient, users: any[], courses: any[]): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string | null;
    courseId: string;
    authorId: string;
    duration: number;
    totalMarks: number;
    passingMarks: number;
    startTime: Date | null;
    endTime: Date | null;
}[]>;
//# sourceMappingURL=quizzes.d.ts.map