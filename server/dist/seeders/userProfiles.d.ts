import { PrismaClient } from '@prisma/client';
export declare function seedUserProfiles(prisma: PrismaClient): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    phone: string;
    address: string | null;
    city: string | null;
    state: string | null;
    profilePicture: string | null;
}[]>;
//# sourceMappingURL=userProfiles.d.ts.map