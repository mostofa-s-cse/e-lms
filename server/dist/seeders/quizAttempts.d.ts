import { PrismaClient } from '@prisma/client';
export declare function seedQuizAttempts(prisma: PrismaClient, users: any[], quizzes: any[]): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    studentId: string;
    totalMarks: number;
    quizId: string;
    score: number;
    isPassed: boolean;
    startedAt: Date;
    completedAt: Date | null;
}[]>;
//# sourceMappingURL=quizAttempts.d.ts.map