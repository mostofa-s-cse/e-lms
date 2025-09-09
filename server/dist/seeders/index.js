"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = main;
const client_1 = require("@prisma/client");
const users_1 = require("./users");
const userProfiles_1 = require("./userProfiles");
const courses_1 = require("./courses");
const intakes_1 = require("./intakes");
const enrollments_1 = require("./enrollments");
const notes_1 = require("./notes");
const videos_1 = require("./videos");
const quizzes_1 = require("./quizzes");
const questions_1 = require("./questions");
const quizAttempts_1 = require("./quizAttempts");
const evaluations_1 = require("./evaluations");
const payments_1 = require("./payments");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    try {
        console.log('🔍 Checking database connection...');
        await prisma.$connect();
        try {
            await prisma.user.findFirst();
            console.log('✅ Database schema exists, proceeding with cleanup...');
            console.log('🧹 Clearing existing data...');
            await prisma.payment.deleteMany();
            await prisma.evaluation.deleteMany();
            await prisma.quizAttempt.deleteMany();
            await prisma.question.deleteMany();
            await prisma.quiz.deleteMany();
            await prisma.video.deleteMany();
            await prisma.note.deleteMany();
            await prisma.enrollment.deleteMany();
            await prisma.intake.deleteMany();
            await prisma.course.deleteMany();
            await prisma.userProfile.deleteMany();
            await prisma.user.deleteMany();
        }
        catch (error) {
            if (error.code === 'P2021') {
                console.log('❌ Database tables do not exist. Please run the following commands first:');
                console.log('');
                console.log('  1. Generate Prisma client:');
                console.log('     npm run db:generate');
                console.log('');
                console.log('  2. Push schema to database:');
                console.log('     npm run db:push');
                console.log('');
                console.log('  3. Then run the seeder again:');
                console.log('     npm run seed');
                console.log('');
                process.exit(1);
            }
            else {
                throw error;
            }
        }
        console.log('👥 Seeding users...');
        const users = await (0, users_1.seedUsers)(prisma);
        console.log('👤 Seeding user profiles...');
        const profiles = await (0, userProfiles_1.seedUserProfiles)(prisma);
        console.log('📚 Seeding courses...');
        const courses = await (0, courses_1.seedCourses)(prisma, users);
        console.log('📅 Seeding intakes...');
        const intakes = await (0, intakes_1.seedIntakes)(prisma, courses);
        console.log('🎓 Seeding enrollments...');
        const enrollments = await (0, enrollments_1.seedEnrollments)(prisma, users, courses, intakes);
        console.log('📝 Seeding notes...');
        await (0, notes_1.seedNotes)(prisma, users, courses);
        console.log('🎥 Seeding videos...');
        await (0, videos_1.seedVideos)(prisma, users, courses);
        console.log('📋 Seeding quizzes...');
        const quizzes = await (0, quizzes_1.seedQuizzes)(prisma, users, courses);
        console.log('❓ Seeding questions...');
        await (0, questions_1.seedQuestions)(prisma, users, quizzes);
        console.log('📊 Seeding quiz attempts...');
        await (0, quizAttempts_1.seedQuizAttempts)();
        console.log('📈 Seeding evaluations...');
        await (0, evaluations_1.seedEvaluations)(prisma, users);
        console.log('💳 Seeding payments...');
        await (0, payments_1.seedPayments)();
        console.log('✅ Database seeding completed successfully!');
        console.log(`📊 Seeded ${users.length} users, ${profiles.length} profiles, ${courses.length} courses, ${intakes.length} intakes`);
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
if (require.main === module) {
    main()
        .then(() => {
        console.log('🎉 Seeding finished');
        process.exit(0);
    })
        .catch((error) => {
        console.error('💥 Seeding failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map