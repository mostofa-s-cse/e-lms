"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedQuizAttempts = seedQuizAttempts;
const client_1 = require("@prisma/client");
async function seedQuizAttempts(prisma, users, quizzes) {
    const students = users.filter(user => user.role === client_1.UserRole.STUDENT);
    const quizAttemptsData = [
        {
            studentId: students[0].id,
            quizId: quizzes.find(q => q.title === 'Programming Fundamentals Quiz')?.id,
            score: 42,
            totalMarks: 50,
            isPassed: true,
            startedAt: new Date('2024-09-15T10:05:00Z'),
            completedAt: new Date('2024-09-15T10:25:00Z')
        },
        {
            studentId: students[1].id,
            quizId: quizzes.find(q => q.title === 'Programming Fundamentals Quiz')?.id,
            score: 38,
            totalMarks: 50,
            isPassed: true,
            startedAt: new Date('2024-09-15T10:10:00Z'),
            completedAt: new Date('2024-09-15T10:30:00Z')
        },
        {
            studentId: students[2].id,
            quizId: quizzes.find(q => q.title === 'Programming Fundamentals Quiz')?.id,
            score: 28,
            totalMarks: 50,
            isPassed: false,
            startedAt: new Date('2024-09-15T10:15:00Z'),
            completedAt: new Date('2024-09-15T10:40:00Z')
        },
        {
            studentId: students[0].id,
            quizId: quizzes.find(q => q.title === 'Data Structures Midterm')?.id,
            score: 85,
            totalMarks: 100,
            isPassed: true,
            startedAt: new Date('2024-10-01T14:05:00Z'),
            completedAt: new Date('2024-10-01T14:55:00Z')
        },
        {
            studentId: students[1].id,
            quizId: quizzes.find(q => q.title === 'Data Structures Midterm')?.id,
            score: 72,
            totalMarks: 100,
            isPassed: true,
            startedAt: new Date('2024-10-01T14:10:00Z'),
            completedAt: new Date('2024-10-01T15:05:00Z')
        },
        {
            studentId: students[3].id,
            quizId: quizzes.find(q => q.title === 'Calculus Basics Quiz')?.id,
            score: 65,
            totalMarks: 80,
            isPassed: true,
            startedAt: new Date('2024-09-20T11:05:00Z'),
            completedAt: new Date('2024-09-20T11:40:00Z')
        },
        {
            studentId: students[4].id,
            quizId: quizzes.find(q => q.title === 'Calculus Basics Quiz')?.id,
            score: 58,
            totalMarks: 80,
            isPassed: true,
            startedAt: new Date('2024-09-20T11:10:00Z'),
            completedAt: new Date('2024-09-20T11:45:00Z')
        },
        {
            studentId: students[5].id,
            quizId: quizzes.find(q => q.title === 'Calculus Basics Quiz')?.id,
            score: 45,
            totalMarks: 80,
            isPassed: false,
            startedAt: new Date('2024-09-20T11:15:00Z'),
            completedAt: new Date('2024-09-20T11:50:00Z')
        },
        {
            studentId: students[6].id,
            quizId: quizzes.find(q => q.title === 'Management Principles Quiz')?.id,
            score: 48,
            totalMarks: 60,
            isPassed: true,
            startedAt: new Date('2024-09-25T14:05:00Z'),
            completedAt: new Date('2024-09-25T14:35:00Z')
        },
        {
            studentId: students[7].id,
            quizId: quizzes.find(q => q.title === 'Management Principles Quiz')?.id,
            score: 52,
            totalMarks: 60,
            isPassed: true,
            startedAt: new Date('2024-09-25T14:10:00Z'),
            completedAt: new Date('2024-09-25T14:40:00Z')
        },
        {
            studentId: students[8].id,
            quizId: quizzes.find(q => q.title === 'Management Principles Quiz')?.id,
            score: 35,
            totalMarks: 60,
            isPassed: false,
            startedAt: new Date('2024-09-25T14:15:00Z'),
            completedAt: new Date('2024-09-25T14:45:00Z')
        },
        {
            studentId: students[7].id,
            quizId: quizzes.find(q => q.title === 'Marketing Strategy Assessment')?.id,
            score: 68,
            totalMarks: 85,
            isPassed: true,
            startedAt: new Date('2024-11-05T10:05:00Z'),
            completedAt: new Date('2024-11-05T10:45:00Z')
        },
        {
            studentId: students[8].id,
            quizId: quizzes.find(q => q.title === 'Marketing Strategy Assessment')?.id,
            score: 55,
            totalMarks: 85,
            isPassed: false,
            startedAt: new Date('2024-11-05T10:10:00Z'),
            completedAt: new Date('2024-11-05T10:50:00Z')
        },
        {
            studentId: students[9].id,
            quizId: quizzes.find(q => q.title === 'Literary Analysis Quiz')?.id,
            score: 58,
            totalMarks: 70,
            isPassed: true,
            startedAt: new Date('2024-09-30T15:05:00Z'),
            completedAt: new Date('2024-09-30T15:40:00Z')
        },
        {
            studentId: students[10].id,
            quizId: quizzes.find(q => q.title === 'Literary Analysis Quiz')?.id,
            score: 62,
            totalMarks: 70,
            isPassed: true,
            startedAt: new Date('2024-09-30T15:10:00Z'),
            completedAt: new Date('2024-09-30T15:45:00Z')
        },
        {
            studentId: students[11].id,
            quizId: quizzes.find(q => q.title === 'Literary Analysis Quiz')?.id,
            score: 45,
            totalMarks: 70,
            isPassed: false,
            startedAt: new Date('2024-09-30T15:15:00Z'),
            completedAt: new Date('2024-09-30T15:50:00Z')
        },
        {
            studentId: students[12].id,
            quizId: quizzes.find(q => q.title === 'Newton\'s Laws Quiz')?.id,
            score: 52,
            totalMarks: 65,
            isPassed: true,
            startedAt: new Date('2024-10-05T11:05:00Z'),
            completedAt: new Date('2024-10-05T11:35:00Z')
        },
        {
            studentId: students[13].id,
            quizId: quizzes.find(q => q.title === 'Newton\'s Laws Quiz')?.id,
            score: 48,
            totalMarks: 65,
            isPassed: true,
            startedAt: new Date('2024-10-05T11:10:00Z'),
            completedAt: new Date('2024-10-05T11:40:00Z')
        },
        {
            studentId: students[14].id,
            quizId: quizzes.find(q => q.title === 'Newton\'s Laws Quiz')?.id,
            score: 38,
            totalMarks: 65,
            isPassed: false,
            startedAt: new Date('2024-10-05T11:15:00Z'),
            completedAt: new Date('2024-10-05T11:45:00Z')
        },
        {
            studentId: students[12].id,
            quizId: quizzes.find(q => q.title === 'Chemistry Lab Safety Quiz')?.id,
            score: 28,
            totalMarks: 30,
            isPassed: true,
            startedAt: new Date('2024-09-10T09:05:00Z'),
            completedAt: new Date('2024-09-10T09:20:00Z')
        },
        {
            studentId: students[13].id,
            quizId: quizzes.find(q => q.title === 'Chemistry Lab Safety Quiz')?.id,
            score: 25,
            totalMarks: 30,
            isPassed: true,
            startedAt: new Date('2024-09-10T09:10:00Z'),
            completedAt: new Date('2024-09-10T09:25:00Z')
        },
        {
            studentId: students[14].id,
            quizId: quizzes.find(q => q.title === 'Chemistry Lab Safety Quiz')?.id,
            score: 18,
            totalMarks: 30,
            isPassed: false,
            startedAt: new Date('2024-09-10T09:15:00Z'),
            completedAt: new Date('2024-09-10T09:30:00Z')
        },
        {
            studentId: students[0].id,
            quizId: quizzes.find(q => q.title === 'Web Development Final')?.id,
            score: 125,
            totalMarks: 150,
            isPassed: true,
            startedAt: new Date('2024-12-10T09:05:00Z'),
            completedAt: new Date('2024-12-10T10:35:00Z')
        },
        {
            studentId: students[1].id,
            quizId: quizzes.find(q => q.title === 'Web Development Final')?.id,
            score: 110,
            totalMarks: 150,
            isPassed: true,
            startedAt: new Date('2024-12-10T09:10:00Z'),
            completedAt: new Date('2024-12-10T10:40:00Z')
        },
        {
            studentId: students[3].id,
            quizId: quizzes.find(q => q.title === 'Statistics Final Exam')?.id,
            score: 165,
            totalMarks: 200,
            isPassed: true,
            startedAt: new Date('2025-04-20T10:05:00Z'),
            completedAt: new Date('2025-04-20T12:15:00Z')
        },
        {
            studentId: students[4].id,
            quizId: quizzes.find(q => q.title === 'Statistics Final Exam')?.id,
            score: 142,
            totalMarks: 200,
            isPassed: true,
            startedAt: new Date('2025-04-20T10:10:00Z'),
            completedAt: new Date('2025-04-20T12:20:00Z')
        },
        {
            studentId: students[6].id,
            quizId: quizzes.find(q => q.title === 'Financial Accounting Quiz')?.id,
            score: 78,
            totalMarks: 100,
            isPassed: true,
            startedAt: new Date('2024-12-05T13:05:00Z'),
            completedAt: new Date('2024-12-05T14:15:00Z')
        },
        {
            studentId: students[7].id,
            quizId: quizzes.find(q => q.title === 'Financial Accounting Quiz')?.id,
            score: 82,
            totalMarks: 100,
            isPassed: true,
            startedAt: new Date('2024-12-05T13:10:00Z'),
            completedAt: new Date('2024-12-05T14:20:00Z')
        },
        {
            studentId: students[9].id,
            quizId: quizzes.find(q => q.title === 'Creative Writing Portfolio Review')?.id,
            score: 78,
            totalMarks: 100,
            isPassed: true,
            startedAt: new Date('2024-11-20T10:05:00Z'),
            completedAt: new Date('2024-11-20T12:15:00Z')
        },
        {
            studentId: students[10].id,
            quizId: quizzes.find(q => q.title === 'Creative Writing Portfolio Review')?.id,
            score: 85,
            totalMarks: 100,
            isPassed: true,
            startedAt: new Date('2024-11-20T10:10:00Z'),
            completedAt: new Date('2024-11-20T12:20:00Z')
        },
        {
            studentId: students[12].id,
            quizId: quizzes.find(q => q.title === 'Energy and Conservation Quiz')?.id,
            score: 62,
            totalMarks: 80,
            isPassed: true,
            startedAt: new Date('2024-11-10T14:05:00Z'),
            completedAt: new Date('2024-11-10T14:45:00Z')
        },
        {
            studentId: students[13].id,
            quizId: quizzes.find(q => q.title === 'Energy and Conservation Quiz')?.id,
            score: 58,
            totalMarks: 80,
            isPassed: true,
            startedAt: new Date('2024-11-10T14:10:00Z'),
            completedAt: new Date('2024-11-10T14:50:00Z')
        }
    ];
    const quizAttempts = await Promise.all(quizAttemptsData.map(attemptData => prisma.quizAttempt.create({
        data: attemptData
    })));
    console.log(`✅ Created ${quizAttempts.length} quiz attempts`);
    return quizAttempts;
}
//# sourceMappingURL=quizAttempts.js.map