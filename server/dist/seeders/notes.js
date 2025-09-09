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
            attachment: '/uploads/notes/cs101-intro-programming.pdf',
            attachmentSize: 2048576,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'CS101')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Data Structures Overview',
            description: 'Detailed notes on arrays, linked lists, stacks, and queues with implementation examples.',
            attachment: '/uploads/notes/cs201-data-structures.pdf',
            attachmentSize: 3145728,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'CS201')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Web Development Fundamentals',
            description: 'HTML, CSS, and JavaScript basics with practical examples and best practices.',
            attachment: '/uploads/notes/cs301-web-dev-fundamentals.pdf',
            attachmentSize: 1572864,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'CS301')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Database Design Principles',
            description: 'Database normalization, ER diagrams, and SQL fundamentals for database design.',
            attachment: '/uploads/notes/cs401-database-design.pdf',
            attachmentSize: 2621440,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'CS401')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Calculus Fundamentals',
            description: 'Limits, derivatives, and integrals with applications and problem-solving techniques.',
            attachment: '/uploads/notes/math201-calculus.pdf',
            attachmentSize: 3670016,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'MATH201')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Linear Algebra Essentials',
            description: 'Matrices, vectors, eigenvalues, and linear transformations with practical applications.',
            attachment: '/uploads/notes/math201-linear-algebra.pdf',
            attachmentSize: 2097152,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'MATH201')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Statistical Methods',
            description: 'Descriptive statistics, probability distributions, and hypothesis testing methods.',
            attachment: '/uploads/notes/math301-statistics.pdf',
            attachmentSize: 2883584,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'MATH301')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Management Principles',
            description: 'Core management concepts, leadership styles, and organizational behavior theories.',
            attachment: '/uploads/notes/bus301-management.pdf',
            attachmentSize: 1835008,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'BUS301')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Marketing Strategy',
            description: 'Market analysis, segmentation, targeting, and positioning strategies.',
            attachment: '/uploads/notes/mkt201-marketing.pdf',
            attachmentSize: 1572864,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'MKT201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Financial Accounting Basics',
            description: 'Accounting principles, financial statements, and bookkeeping fundamentals.',
            attachment: '/uploads/notes/acc201-accounting.pdf',
            attachmentSize: 2359296,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'ACC201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'HR Management Practices',
            description: 'Recruitment, training, performance management, and employee relations.',
            attachment: '/uploads/notes/hrm201-hr-practices.pdf',
            attachmentSize: 1310720,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'HRM201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Literary Analysis Techniques',
            description: 'Methods for analyzing poetry, prose, and drama with critical thinking approaches.',
            attachment: '/uploads/notes/eng201-literary-analysis.pdf',
            attachmentSize: 1048576,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'ENG201')?.id,
            authorId: teachers[3].id
        },
        {
            title: 'Creative Writing Workshop',
            description: 'Writing techniques, character development, and narrative structure for creative writing.',
            attachment: '/uploads/notes/eng301-creative-writing.pdf',
            attachmentSize: 786432,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'ENG301')?.id,
            authorId: teachers[3].id
        },
        {
            title: 'Mechanics and Motion',
            description: 'Newton\'s laws, kinematics, dynamics, and energy conservation principles.',
            attachment: '/uploads/notes/phy101-mechanics.pdf',
            attachmentSize: 3145728,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'PHY101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Thermodynamics Fundamentals',
            description: 'Heat, temperature, entropy, and thermodynamic processes with practical applications.',
            attachment: '/uploads/notes/phy101-thermodynamics.pdf',
            attachmentSize: 2097152,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'PHY101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Chemistry Laboratory Safety',
            description: 'Laboratory safety protocols, equipment usage, and experimental procedures.',
            attachment: '/uploads/notes/chem101-lab-safety.pdf',
            attachmentSize: 524288,
            attachmentType: 'application/pdf',
            isImage: false,
            isActive: true,
            courseId: courses.find(c => c.code === 'CHEM101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Digital Electronics Basics',
            description: 'Logic gates, Boolean algebra, and digital circuit design principles.',
            attachment: '/uploads/notes/ee201-digital-electronics.pdf',
            attachmentSize: 1835008,
            attachmentType: 'application/pdf',
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