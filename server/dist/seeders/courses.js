"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCourses = seedCourses;
const client_1 = require("@prisma/client");
async function seedCourses(prisma, users) {
    const teachers = users.filter(user => user.role === client_1.UserRole.TEACHER);
    const coursesData = [
        {
            title: 'Introduction to Computer Science',
            description: 'A comprehensive introduction to computer science fundamentals including programming, algorithms, and data structures. Students will learn basic programming concepts and problem-solving techniques.',
            code: 'CS101',
            credits: 3,
            price: 800.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[0].id
        },
        {
            title: 'Advanced Mathematics',
            description: 'Advanced mathematical concepts including calculus, linear algebra, and differential equations. This course provides the mathematical foundation for engineering and science disciplines.',
            code: 'MATH201',
            credits: 4,
            price: 900.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[1].id
        },
        {
            title: 'Business Management',
            description: 'Principles of business management including organizational behavior, strategic planning, and leadership. Students will develop management skills through case studies and practical exercises.',
            code: 'BUS301',
            credits: 3,
            price: 750.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[2].id
        },
        {
            title: 'English Literature',
            description: 'Study of classic and contemporary English literature. Students will analyze various literary works and develop critical thinking and analytical writing skills.',
            code: 'ENG201',
            credits: 3,
            price: 0.00,
            isFree: true,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[3].id
        },
        {
            title: 'Physics Fundamentals',
            description: 'Introduction to physics concepts including mechanics, thermodynamics, and electromagnetism. Laboratory work and theoretical applications are emphasized.',
            code: 'PHY101',
            credits: 4,
            price: 950.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[4].id
        },
        {
            title: 'Data Structures and Algorithms',
            description: 'Advanced study of data structures and algorithm design. Topics include trees, graphs, sorting algorithms, and complexity analysis.',
            code: 'CS201',
            credits: 4,
            price: 0.00,
            isFree: true,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[0].id
        },
        {
            title: 'Marketing Principles',
            description: 'Fundamental marketing concepts including market research, consumer behavior, and marketing strategies. Students will develop marketing plans and campaigns.',
            code: 'MKT201',
            credits: 3,
            price: 800.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[2].id
        },
        {
            title: 'Chemistry Laboratory',
            description: 'Hands-on laboratory experience in chemistry. Students will perform experiments, analyze results, and develop laboratory safety and documentation skills.',
            code: 'CHEM101',
            credits: 2,
            price: 600.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[4].id
        },
        {
            title: 'Web Development',
            description: 'Modern web development techniques including HTML, CSS, JavaScript, and frameworks. Students will build responsive and interactive web applications.',
            code: 'CS301',
            credits: 3,
            price: 1100.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[0].id
        },
        {
            title: 'Financial Accounting',
            description: 'Principles of financial accounting and reporting. Students will learn to prepare financial statements and understand accounting standards and practices.',
            code: 'ACC201',
            credits: 3,
            price: 850.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[2].id
        },
        {
            title: 'Creative Writing',
            description: 'Development of creative writing skills in various genres including fiction, poetry, and creative non-fiction. Students will workshop their writing and receive feedback.',
            code: 'ENG301',
            credits: 3,
            price: 650.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[3].id
        },
        {
            title: 'Database Systems',
            description: 'Design and implementation of database systems. Topics include SQL, database design, normalization, and database management systems.',
            code: 'CS401',
            credits: 3,
            price: 1200.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[0].id
        },
        {
            title: 'Statistics and Probability',
            description: 'Statistical methods and probability theory. Students will learn data analysis, hypothesis testing, and statistical inference techniques.',
            code: 'MATH301',
            credits: 3,
            price: 900.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[1].id
        },
        {
            title: 'Human Resource Management',
            description: 'Principles of human resource management including recruitment, training, performance management, and employee relations.',
            code: 'HRM201',
            credits: 3,
            price: 800.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[2].id
        },
        {
            title: 'Digital Electronics',
            description: 'Fundamentals of digital electronics and digital circuit design. Topics include logic gates, Boolean algebra, and digital system design.',
            code: 'EE201',
            credits: 4,
            price: 1100.00,
            isFree: false,
            thumbnail: null,
            isActive: true,
            teacherId: teachers[4].id
        }
    ];
    const courses = await Promise.all(coursesData.map(courseData => prisma.course.create({
        data: courseData
    })));
    console.log(`✅ Created ${courses.length} courses`);
    return courses;
}
//# sourceMappingURL=courses.js.map