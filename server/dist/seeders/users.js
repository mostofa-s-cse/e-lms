"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seedUsers(prisma) {
    const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
    const usersData = [
        {
            email: 'admin@university.edu',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Admin',
            role: client_1.UserRole.ADMIN,
            isActive: true
        },
        {
            email: 'admin2@university.edu',
            password: hashedPassword,
            firstName: 'Sarah',
            lastName: 'Director',
            role: client_1.UserRole.ADMIN,
            isActive: true
        },
        {
            email: 'prof.smith@university.edu',
            password: hashedPassword,
            firstName: 'Dr. Michael',
            lastName: 'Smith',
            role: client_1.UserRole.TEACHER,
            isActive: true
        },
        {
            email: 'prof.johnson@university.edu',
            password: hashedPassword,
            firstName: 'Dr. Emily',
            lastName: 'Johnson',
            role: client_1.UserRole.TEACHER,
            isActive: true
        },
        {
            email: 'prof.williams@university.edu',
            password: hashedPassword,
            firstName: 'Prof. David',
            lastName: 'Williams',
            role: client_1.UserRole.TEACHER,
            isActive: true
        },
        {
            email: 'prof.brown@university.edu',
            password: hashedPassword,
            firstName: 'Dr. Lisa',
            lastName: 'Brown',
            role: client_1.UserRole.TEACHER,
            isActive: true
        },
        {
            email: 'prof.davis@university.edu',
            password: hashedPassword,
            firstName: 'Prof. Robert',
            lastName: 'Davis',
            role: client_1.UserRole.TEACHER,
            isActive: true
        },
        {
            email: 'student1@university.edu',
            password: hashedPassword,
            firstName: 'Alice',
            lastName: 'Johnson',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student2@university.edu',
            password: hashedPassword,
            firstName: 'Bob',
            lastName: 'Smith',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student3@university.edu',
            password: hashedPassword,
            firstName: 'Carol',
            lastName: 'Williams',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student4@university.edu',
            password: hashedPassword,
            firstName: 'David',
            lastName: 'Brown',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student5@university.edu',
            password: hashedPassword,
            firstName: 'Emma',
            lastName: 'Davis',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student6@university.edu',
            password: hashedPassword,
            firstName: 'Frank',
            lastName: 'Miller',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student7@university.edu',
            password: hashedPassword,
            firstName: 'Grace',
            lastName: 'Wilson',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student8@university.edu',
            password: hashedPassword,
            firstName: 'Henry',
            lastName: 'Taylor',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student9@university.edu',
            password: hashedPassword,
            firstName: 'Ivy',
            lastName: 'Anderson',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student10@university.edu',
            password: hashedPassword,
            firstName: 'Jack',
            lastName: 'Thomas',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student11@university.edu',
            password: hashedPassword,
            firstName: 'Kate',
            lastName: 'Jackson',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student12@university.edu',
            password: hashedPassword,
            firstName: 'Liam',
            lastName: 'White',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student13@university.edu',
            password: hashedPassword,
            firstName: 'Mia',
            lastName: 'Harris',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student14@university.edu',
            password: hashedPassword,
            firstName: 'Noah',
            lastName: 'Martin',
            role: client_1.UserRole.STUDENT,
            isActive: true
        },
        {
            email: 'student15@university.edu',
            password: hashedPassword,
            firstName: 'Olivia',
            lastName: 'Thompson',
            role: client_1.UserRole.STUDENT,
            isActive: true
        }
    ];
    const users = await Promise.all(usersData.map(userData => prisma.user.create({
        data: userData
    })));
    console.log(`✅ Created ${users.length} users`);
    return users;
}
//# sourceMappingURL=users.js.map