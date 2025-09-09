import { PrismaClient } from '@prisma/client';
export declare function seedNotes(prisma: PrismaClient, users: any[], courses: any[]): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string | null;
    courseId: string;
    attachment: string | null;
    isImage: boolean | null;
    attachmentSize: number | null;
    attachmentType: string | null;
    authorId: string;
}[]>;
//# sourceMappingURL=notes.d.ts.map