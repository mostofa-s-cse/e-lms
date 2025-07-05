"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedNotes = seedNotes;
const client_1 = require("@prisma/client");
async function seedNotes(prisma, users, courses) {
    const teachers = users.filter(user => user.role === client_1.UserRole.TEACHER);
    const notesData = [
        {
            title: 'Introduction to Programming Concepts',
            description: 'Comprehensive guide covering basic programming concepts, variables, data types, and control structures.',
            file: '/uploads/notes/cs101-intro-programming.pdf',
            fileSize: 2048576,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'CS101')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Data Structures Overview',
            description: 'Detailed notes on arrays, linked lists, stacks, and queues with implementation examples.',
            file: '/uploads/notes/cs201-data-structures.pdf',
            fileSize: 3145728,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'CS201')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Web Development Fundamentals',
            description: 'HTML, CSS, and JavaScript basics with practical examples and best practices.',
            file: '/uploads/notes/cs301-web-dev-fundamentals.pdf',
            fileSize: 1572864,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'CS301')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Database Design Principles',
            description: 'Database normalization, ER diagrams, and SQL fundamentals for database design.',
            file: '/uploads/notes/cs401-database-design.pdf',
            fileSize: 2621440,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'CS401')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Calculus Fundamentals',
            description: 'Limits, derivatives, and integrals with applications and problem-solving techniques.',
            file: '/uploads/notes/math201-calculus.pdf',
            fileSize: 3670016,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'MATH201')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Linear Algebra Essentials',
            description: 'Matrices, vectors, eigenvalues, and linear transformations with practical applications.',
            file: '/uploads/notes/math201-linear-algebra.pdf',
            fileSize: 2097152,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'MATH201')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Statistical Methods',
            description: 'Descriptive statistics, probability distributions, and hypothesis testing methods.',
            file: '/uploads/notes/math301-statistics.pdf',
            fileSize: 2883584,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'MATH301')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Management Principles',
            description: 'Core management concepts, leadership styles, and organizational behavior theories.',
            file: '/uploads/notes/bus301-management.pdf',
            fileSize: 1835008,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'BUS301')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Marketing Strategy',
            description: 'Market analysis, segmentation, targeting, and positioning strategies.',
            file: '/uploads/notes/mkt201-marketing.pdf',
            fileSize: 1572864,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'MKT201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Financial Accounting Basics',
            description: 'Accounting principles, financial statements, and bookkeeping fundamentals.',
            file: '/uploads/notes/acc201-accounting.pdf',
            fileSize: 2359296,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'ACC201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'HR Management Practices',
            description: 'Recruitment, training, performance management, and employee relations.',
            file: '/uploads/notes/hrm201-hr-practices.pdf',
            fileSize: 1310720,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'HRM201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Literary Analysis Techniques',
            description: 'Methods for analyzing poetry, prose, and drama with critical thinking approaches.',
            file: '/uploads/notes/eng201-literary-analysis.pdf',
            fileSize: 1048576,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'ENG201')?.id,
            authorId: teachers[3].id
        },
        {
            title: 'Creative Writing Workshop',
            description: 'Writing techniques, character development, and narrative structure for creative writing.',
            file: '/uploads/notes/eng301-creative-writing.pdf',
            fileSize: 786432,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'ENG301')?.id,
            authorId: teachers[3].id
        },
        {
            title: 'Mechanics and Motion',
            description: 'Newton\'s laws, kinematics, dynamics, and energy conservation principles.',
            file: '/uploads/notes/phy101-mechanics.pdf',
            fileSize: 3145728,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'PHY101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Thermodynamics Fundamentals',
            description: 'Heat, temperature, entropy, and thermodynamic processes with practical applications.',
            file: '/uploads/notes/phy101-thermodynamics.pdf',
            fileSize: 2097152,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'PHY101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Chemistry Laboratory Safety',
            description: 'Laboratory safety protocols, equipment usage, and experimental procedures.',
            file: '/uploads/notes/chem101-lab-safety.pdf',
            fileSize: 524288,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'CHEM101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Digital Electronics Basics',
            description: 'Logic gates, Boolean algebra, and digital circuit design principles.',
            file: '/uploads/notes/ee201-digital-electronics.pdf',
            fileSize: 1835008,
            fileType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'EE201')?.id,
            authorId: teachers[4].id
        }
    ];
    const notes = await Promise.all(notesData.map(noteData => prisma.note.create({
        data: noteData
    })));
    console.log(`✅ Created ${notes.length} notes`);
    return notes;
}
//# sourceMappingURL=notes.js.map