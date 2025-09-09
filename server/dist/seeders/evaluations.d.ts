import { PrismaClient } from '@prisma/client';
export declare function seedEvaluations(prisma: PrismaClient, users: any[]): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string | null;
    studentId: string;
    courseId: string;
    type: import(".prisma/client").$Enums.EvaluationType;
    score: number;
    maxScore: number;
    feedback: string | null;
    evaluatorId: string;
}[]>;
//# sourceMappingURL=evaluations.d.ts.map