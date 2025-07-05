import { PrismaClient } from '@prisma/client';
export declare function seedEvaluations(prisma: PrismaClient, users: any[]): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string | null;
    studentId: string;
    type: import(".prisma/client").$Enums.EvaluationType;
    score: number | null;
    maxScore: number;
    feedback: string | null;
    evaluatedAt: Date;
    evaluatorId: string;
}[]>;
//# sourceMappingURL=evaluations.d.ts.map