import { PrismaClient } from '@prisma/client';
export declare function seedUsers(prisma: PrismaClient): Promise<{
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: import(".prisma/client").$Enums.UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}[]>;
//# sourceMappingURL=users.d.ts.map