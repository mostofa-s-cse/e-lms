import { PrismaClient } from '@prisma/client';
export declare function seedNotes(prisma: PrismaClient, users: any[], courses: any[]): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string | null;
    courseId: string;
    file: string | null;
    isImage: boolean | null;
    fileSize: number | null;
    fileType: string | null;
    authorId: string;
}[]>;
//# sourceMappingURL=notes.d.ts.map