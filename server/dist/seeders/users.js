"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seedUsers(prisma) {
    const hashedPassword = await bcryptjs_1.default.hash('Password123', 10);
    const usersData = [
        {
            email: 'admin@university.edu',
            password: hashedPassword,
            firstName: 'Ahmed',
            lastName: 'Hossain',
            role: client_1.UserRole.ADMIN,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'admin2@university.edu',
            password: hashedPassword,
            firstName: 'Fatima',
            lastName: 'Rahman',
            role: client_1.UserRole.ADMIN,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'prof.ali@university.edu',
            password: hashedPassword,
            firstName: 'Dr. Mohammad',
            lastName: 'Ali',
            role: client_1.UserRole.TEACHER,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'prof.ayesha@university.edu',
            password: hashedPassword,
            firstName: 'Dr. Ayesha',
            lastName: 'Begum',
            role: client_1.UserRole.TEACHER,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'prof.kamal@university.edu',
            password: hashedPassword,
            firstName: 'Prof. Kamal',
            lastName: 'Uddin',
            role: client_1.UserRole.TEACHER,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'prof.nasreen@university.edu',
            password: hashedPassword,
            firstName: 'Dr. Nasreen',
            lastName: 'Khan',
            role: client_1.UserRole.TEACHER,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'prof.rahim@university.edu',
            password: hashedPassword,
            firstName: 'Prof. Rahim',
            lastName: 'Chowdhury',
            role: client_1.UserRole.TEACHER,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.bilal@university.edu',
            password: hashedPassword,
            firstName: 'Bilal',
            lastName: 'Ahmed',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.aisha@university.edu',
            password: hashedPassword,
            firstName: 'Aisha',
            lastName: 'Islam',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.chowdhury@university.edu',
            password: hashedPassword,
            firstName: 'Chowdhury',
            lastName: 'Zaman',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.dina@university.edu',
            password: hashedPassword,
            firstName: 'Dina',
            lastName: 'Begum',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.emon@university.edu',
            password: hashedPassword,
            firstName: 'Emon',
            lastName: 'Das',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.farhana@university.edu',
            password: hashedPassword,
            firstName: 'Farhana',
            lastName: 'Miah',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.golam@university.edu',
            password: hashedPassword,
            firstName: 'Golam',
            lastName: 'Rasul',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.habiba@university.edu',
            password: hashedPassword,
            firstName: 'Habiba',
            lastName: 'Sultana',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.imran@university.edu',
            password: hashedPassword,
            firstName: 'Imran',
            lastName: 'Haque',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.jannat@university.edu',
            password: hashedPassword,
            firstName: 'Jannat',
            lastName: 'Ferdous',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.karim@university.edu',
            password: hashedPassword,
            firstName: 'Karim',
            lastName: 'Mollah',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.lamia@university.edu',
            password: hashedPassword,
            firstName: 'Lamia',
            lastName: 'Nahar',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.mahmud@university.edu',
            password: hashedPassword,
            firstName: 'Mahmud',
            lastName: 'Omar',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.nadia@university.edu',
            password: hashedPassword,
            firstName: 'Nadia',
            lastName: 'Parvin',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'student.omar@university.edu',
            password: hashedPassword,
            firstName: 'Omar',
            lastName: 'Qureshi',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedBy: null
        },
        {
            email: 'pending.student.aisha@university.edu',
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'PendingStudent',
            role: client_1.UserRole.STUDENT,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.PENDING,
            approvedAt: null,
            approvedBy: null
        },
        {
            email: 'pending.teacher.ali@university.edu',
            password: hashedPassword,
            firstName: 'Dr. Test',
            lastName: 'PendingTeacher',
            role: client_1.UserRole.TEACHER,
            isActive: true,
            approvalStatus: client_1.ApprovalStatus.PENDING,
            approvedAt: null,
            approvedBy: null
        }
    ];
    const users = await Promise.all(usersData.map(userData => prisma.user.create({
        data: userData
    })));
    console.log(`✅ Created ${users.length} users`);
    return users;
}
//# sourceMappingURL=users.js.map