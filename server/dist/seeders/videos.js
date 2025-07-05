"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedVideos = seedVideos;
const client_1 = require("@prisma/client");
async function seedVideos(prisma, users, courses) {
    const teachers = users.filter(user => user.role === client_1.UserRole.TEACHER);
    const videosData = [
        {
            title: 'Introduction to Programming - Lecture 1',
            description: 'Overview of programming concepts, variables, and basic syntax. This lecture covers the fundamentals of programming languages.',
            videoUrl: '/uploads/videos/cs101-lecture1.mp4',
            duration: 3600,
            thumbnail: '/uploads/thumbnails/cs101-lecture1.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'CS101')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Data Structures - Arrays and Lists',
            description: 'Deep dive into array and linked list implementations with practical examples and performance analysis.',
            videoUrl: '/uploads/videos/cs201-arrays-lists.mp4',
            duration: 4500,
            thumbnail: '/uploads/thumbnails/cs201-arrays.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'CS201')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'HTML and CSS Fundamentals',
            description: 'Building web pages with HTML structure and CSS styling. Covers responsive design principles.',
            videoUrl: '/uploads/videos/cs301-html-css.mp4',
            duration: 5400,
            thumbnail: '/uploads/thumbnails/cs301-html-css.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'CS301')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'JavaScript Programming Basics',
            description: 'Introduction to JavaScript programming including functions, objects, and DOM manipulation.',
            videoUrl: '/uploads/videos/cs301-javascript.mp4',
            duration: 4800,
            thumbnail: '/uploads/thumbnails/cs301-javascript.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'CS301')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Database Design and SQL',
            description: 'Database normalization, ER diagrams, and SQL query writing with practical examples.',
            videoUrl: '/uploads/videos/cs401-database-sql.mp4',
            duration: 6000,
            thumbnail: '/uploads/thumbnails/cs401-database.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'CS401')?.id,
            authorId: teachers[0].id
        },
        {
            title: 'Calculus - Limits and Continuity',
            description: 'Understanding limits, continuity, and the foundation of calculus with graphical and analytical approaches.',
            videoUrl: '/uploads/videos/math201-limits.mp4',
            duration: 5400,
            thumbnail: '/uploads/thumbnails/math201-limits.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'MATH201')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Derivatives and Applications',
            description: 'Derivative rules, chain rule, and applications in optimization and related rates problems.',
            videoUrl: '/uploads/videos/math201-derivatives.mp4',
            duration: 4800,
            thumbnail: '/uploads/thumbnails/math201-derivatives.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'MATH201')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Linear Algebra - Matrices and Vectors',
            description: 'Matrix operations, vector spaces, and linear transformations with real-world applications.',
            videoUrl: '/uploads/videos/math201-linear-algebra.mp4',
            duration: 6000,
            thumbnail: '/uploads/thumbnails/math201-linear.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'MATH201')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Statistics - Descriptive Analysis',
            description: 'Measures of central tendency, dispersion, and data visualization techniques.',
            videoUrl: '/uploads/videos/math301-descriptive-stats.mp4',
            duration: 4200,
            thumbnail: '/uploads/thumbnails/math301-stats.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'MATH301')?.id,
            authorId: teachers[1].id
        },
        {
            title: 'Management Principles and Leadership',
            description: 'Core management concepts, leadership styles, and organizational behavior in modern business.',
            videoUrl: '/uploads/videos/bus301-management.mp4',
            duration: 5400,
            thumbnail: '/uploads/thumbnails/bus301-management.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'BUS301')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Marketing Strategy and Consumer Behavior',
            description: 'Market analysis, consumer psychology, and strategic marketing planning approaches.',
            videoUrl: '/uploads/videos/mkt201-marketing.mp4',
            duration: 4800,
            thumbnail: '/uploads/thumbnails/mkt201-marketing.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'MKT201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Financial Accounting Fundamentals',
            description: 'Accounting principles, financial statements preparation, and bookkeeping practices.',
            videoUrl: '/uploads/videos/acc201-accounting.mp4',
            duration: 6000,
            thumbnail: '/uploads/thumbnails/acc201-accounting.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'ACC201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Human Resource Management',
            description: 'Recruitment strategies, employee development, and performance management systems.',
            videoUrl: '/uploads/videos/hrm201-hr-management.mp4',
            duration: 4500,
            thumbnail: '/uploads/thumbnails/hrm201-hr.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'HRM201')?.id,
            authorId: teachers[2].id
        },
        {
            title: 'Literary Analysis - Poetry and Prose',
            description: 'Techniques for analyzing poetry, short stories, and novels with critical thinking approaches.',
            videoUrl: '/uploads/videos/eng201-literary-analysis.mp4',
            duration: 3600,
            thumbnail: '/uploads/thumbnails/eng201-literary.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'ENG201')?.id,
            authorId: teachers[3].id
        },
        {
            title: 'Creative Writing - Character Development',
            description: 'Creating compelling characters, dialogue writing, and narrative structure techniques.',
            videoUrl: '/uploads/videos/eng301-creative-writing.mp4',
            duration: 4200,
            thumbnail: '/uploads/thumbnails/eng301-creative.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'ENG301')?.id,
            authorId: teachers[3].id
        },
        {
            title: 'Newton\'s Laws and Motion',
            description: 'Newton\'s three laws of motion, force analysis, and applications in real-world scenarios.',
            videoUrl: '/uploads/videos/phy101-newton-laws.mp4',
            duration: 5400,
            thumbnail: '/uploads/thumbnails/phy101-newton.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'PHY101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Energy and Conservation Laws',
            description: 'Kinetic and potential energy, energy conservation, and work-energy theorem applications.',
            videoUrl: '/uploads/videos/phy101-energy.mp4',
            duration: 4800,
            thumbnail: '/uploads/thumbnails/phy101-energy.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'PHY101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Thermodynamics - Heat and Temperature',
            description: 'Thermal energy, temperature scales, heat transfer mechanisms, and thermodynamic processes.',
            videoUrl: '/uploads/videos/phy101-thermodynamics.mp4',
            duration: 4500,
            thumbnail: '/uploads/thumbnails/phy101-thermo.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'PHY101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Chemistry Lab Safety and Procedures',
            description: 'Laboratory safety protocols, equipment usage, and experimental procedure demonstrations.',
            videoUrl: '/uploads/videos/chem101-lab-safety.mp4',
            duration: 1800,
            thumbnail: '/uploads/thumbnails/chem101-lab.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'CHEM101')?.id,
            authorId: teachers[4].id
        },
        {
            title: 'Digital Electronics - Logic Gates',
            description: 'Boolean algebra, logic gate operations, and digital circuit design fundamentals.',
            videoUrl: '/uploads/videos/ee201-logic-gates.mp4',
            duration: 4200,
            thumbnail: '/uploads/thumbnails/ee201-logic.jpg',
            isActive: true,
            courseId: courses.find(c => c.code === 'EE201')?.id,
            authorId: teachers[4].id
        }
    ];
    const videos = await Promise.all(videosData.map(videoData => prisma.video.create({
        data: videoData
    })));
    console.log(`✅ Created ${videos.length} videos`);
    return videos;
}
//# sourceMappingURL=videos.js.map