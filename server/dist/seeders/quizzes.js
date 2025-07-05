"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedQuizzes = seedQuizzes;
const client_1 = require("@prisma/client");
async function seedQuizzes(prisma, users, courses) {
    const teachers = users.filter(user => user.role === client_1.UserRole.TEACHER);
    const quizzesData = [
        {
            title: 'Programming Fundamentals Quiz',
            description: 'Test your understanding of basic programming concepts, variables, and control structures.',
            duration: 30,
            totalMarks: 50,
            passingMarks: 35,
            isActive: true,
            startTime: new Date('2024-09-15T10:00:00Z'),
            endTime: new Date('2024-09-15T11:00:00Z'),
            courseId: courses.find(c => c.code === 'CS101')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Data Structures Midterm',
            description: 'Comprehensive assessment covering arrays, linked lists, stacks, and queues.',
            duration: 60,
            totalMarks: 100,
            passingMarks: 70,
            isActive: true,
            startTime: new Date('2024-10-01T14:00:00Z'),
            endTime: new Date('2024-10-01T15:30:00Z'),
            courseId: courses.find(c => c.code === 'CS201')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Web Development Final',
            description: 'Final assessment covering HTML, CSS, JavaScript, and responsive design principles.',
            duration: 90,
            totalMarks: 150,
            passingMarks: 105,
            isActive: true,
            startTime: new Date('2024-12-10T09:00:00Z'),
            endTime: new Date('2024-12-10T11:00:00Z'),
            courseId: courses.find(c => c.code === 'CS301')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Database Systems Quiz',
            description: 'Test on database design, normalization, and SQL query writing.',
            duration: 45,
            totalMarks: 75,
            passingMarks: 53,
            isActive: true,
            startTime: new Date('2025-02-15T13:00:00Z'),
            endTime: new Date('2025-02-15T14:00:00Z'),
            courseId: courses.find(c => c.code === 'CS401')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Calculus Basics Quiz',
            description: 'Assessment on limits, continuity, and basic derivative concepts.',
            duration: 45,
            totalMarks: 80,
            passingMarks: 56,
            isActive: true,
            startTime: new Date('2024-09-20T11:00:00Z'),
            endTime: new Date('2024-09-20T12:00:00Z'),
            courseId: courses.find(c => c.code === 'MATH201')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Linear Algebra Midterm',
            description: 'Comprehensive test on matrices, vectors, and linear transformations.',
            duration: 75,
            totalMarks: 120,
            passingMarks: 84,
            isActive: true,
            startTime: new Date('2024-10-15T15:00:00Z'),
            endTime: new Date('2024-10-15T16:30:00Z'),
            courseId: courses.find(c => c.code === 'MATH201')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Statistics Final Exam',
            description: 'Final assessment covering descriptive statistics, probability, and hypothesis testing.',
            duration: 120,
            totalMarks: 200,
            passingMarks: 140,
            isActive: true,
            startTime: new Date('2025-04-20T10:00:00Z'),
            endTime: new Date('2025-04-20T12:30:00Z'),
            courseId: courses.find(c => c.code === 'MATH301')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Management Principles Quiz',
            description: 'Test on management concepts, leadership styles, and organizational behavior.',
            duration: 40,
            totalMarks: 60,
            passingMarks: 42,
            isActive: true,
            startTime: new Date('2024-09-25T14:00:00Z'),
            endTime: new Date('2024-09-25T15:00:00Z'),
            courseId: courses.find(c => c.code === 'BUS301')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Marketing Strategy Assessment',
            description: 'Assessment on market analysis, consumer behavior, and marketing strategies.',
            duration: 50,
            totalMarks: 85,
            passingMarks: 60,
            isActive: true,
            startTime: new Date('2024-11-05T10:00:00Z'),
            endTime: new Date('2024-11-05T11:00:00Z'),
            courseId: courses.find(c => c.code === 'MKT201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Financial Accounting Quiz',
            description: 'Test on accounting principles, financial statements, and bookkeeping practices.',
            duration: 60,
            totalMarks: 100,
            passingMarks: 70,
            isActive: true,
            startTime: new Date('2024-12-05T13:00:00Z'),
            endTime: new Date('2024-12-05T14:30:00Z'),
            courseId: courses.find(c => c.code === 'ACC201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'HR Management Final',
            description: 'Final assessment on recruitment, training, and performance management.',
            duration: 90,
            totalMarks: 150,
            passingMarks: 105,
            isActive: true,
            startTime: new Date('2025-03-15T09:00:00Z'),
            endTime: new Date('2025-03-15T11:00:00Z'),
            courseId: courses.find(c => c.code === 'HRM201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Literary Analysis Quiz',
            description: 'Assessment on poetry analysis, prose interpretation, and critical thinking skills.',
            duration: 45,
            totalMarks: 70,
            passingMarks: 49,
            isActive: true,
            startTime: new Date('2024-09-30T15:00:00Z'),
            endTime: new Date('2024-09-30T16:00:00Z'),
            courseId: courses.find(c => c.code === 'ENG201')?.id,
            authorId: teachers[3].id
        },
        {
            title: 'Creative Writing Portfolio Review',
            description: 'Assessment of creative writing skills, character development, and narrative structure.',
            duration: 120,
            totalMarks: 100,
            passingMarks: 70,
            isActive: true,
            startTime: new Date('2024-11-20T10:00:00Z'),
            endTime: new Date('2024-11-20T12:30:00Z'),
            courseId: courses.find(c => c.code === 'ENG301')?.id,
            authorId: teachers[3].id
        },
        {
            title: 'Newton\'s Laws Quiz',
            description: 'Test on Newton\'s three laws of motion and their applications.',
            duration: 40,
            totalMarks: 65,
            passingMarks: 46,
            isActive: true,
            startTime: new Date('2024-10-05T11:00:00Z'),
            endTime: new Date('2024-10-05T12:00:00Z'),
            courseId: courses.find(c => c.code === 'PHY101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Energy and Conservation Quiz',
            description: 'Assessment on kinetic energy, potential energy, and conservation laws.',
            duration: 50,
            totalMarks: 80,
            passingMarks: 56,
            isActive: true,
            startTime: new Date('2024-11-10T14:00:00Z'),
            endTime: new Date('2024-11-10T15:00:00Z'),
            courseId: courses.find(c => c.code === 'PHY101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Chemistry Lab Safety Quiz',
            description: 'Assessment on laboratory safety protocols and equipment usage.',
            duration: 20,
            totalMarks: 30,
            passingMarks: 21,
            isActive: true,
            startTime: new Date('2024-09-10T09:00:00Z'),
            endTime: new Date('2024-09-10T09:30:00Z'),
            courseId: courses.find(c => c.code === 'CHEM101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Digital Electronics Final',
            description: 'Final assessment on logic gates, Boolean algebra, and digital circuit design.',
            duration: 90,
            totalMarks: 150,
            passingMarks: 105,
            isActive: true,
            startTime: new Date('2025-04-25T13:00:00Z'),
            endTime: new Date('2025-04-25T15:00:00Z'),
            courseId: courses.find(c => c.code === 'EE201')?.id,
            authorId: teachers[4].id
        }
    ];
    const quizzes = await Promise.all(quizzesData.map(quizData => prisma.quiz.create({
        data: quizData
    })));
    console.log(`✅ Created ${quizzes.length} quizzes`);
    return quizzes;
}
//# sourceMappingURL=quizzes.js.map