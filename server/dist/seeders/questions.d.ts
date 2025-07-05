import { PrismaClient } from '@prisma/client';
export declare function seedQuestions(prisma: PrismaClient, users: any[], quizzes: any[]): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    question: string;
    type: import(".prisma/client").$Enums.QuestionType;
    options: import("@prisma/client/runtime/library").JsonValue | null;
    correctAnswer: string;
    marks: number;
    quizId: string;
}[]>;
//# sourceMappingURL=questions.d.ts.map