import { PrismaClient } from '@prisma/client';
export declare function seedVideos(prisma: PrismaClient, users: any[], courses: any[]): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string | null;
    thumbnail: string | null;
    courseId: string;
    authorId: string;
    videoUrl: string;
    duration: number;
}[]>;
//# sourceMappingURL=videos.d.ts.map