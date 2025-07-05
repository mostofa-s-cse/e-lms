import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users';
import { seedUserProfiles } from './userProfiles';
import { seedCourses } from './courses';
import { seedIntakes } from './intakes';
import { seedEnrollments } from './enrollments';
import { seedNotes } from './notes';
import { seedVideos } from './videos';
import { seedQuizzes } from './quizzes';
import { seedQuestions } from './questions';
import { seedQuizAttempts } from './quizAttempts';
import { seedEvaluations } from './evaluations';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Check if database is connected and tables exist
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    
    // Try to query a simple table to check if schema exists
    try {
      await prisma.user.findFirst();
      console.log('✅ Database schema exists, proceeding with cleanup...');
      
      // Clear existing data (optional - comment out if you want to keep existing data)
      console.log('🧹 Clearing existing data...');
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
    } catch (error: any) {
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
      } else {
        throw error;
      }
    }

    // Seed data in order (respecting foreign key constraints)
    console.log('👥 Seeding users...');
    const users = await seedUsers(prisma);

    console.log('👤 Seeding user profiles...');
    const profiles = await seedUserProfiles(prisma);

    console.log('📚 Seeding courses...');
    const courses = await seedCourses(prisma, users);

    console.log('📅 Seeding intakes...');
    const intakes = await seedIntakes(prisma, courses);

    console.log('🎓 Seeding enrollments...');
    const enrollments = await seedEnrollments(prisma, users, courses, intakes);

    console.log('📝 Seeding notes...');
    await seedNotes(prisma, users, courses);

    console.log('🎥 Seeding videos...');
    await seedVideos(prisma, users, courses);

    console.log('📋 Seeding quizzes...');
    const quizzes = await seedQuizzes(prisma, users, courses);

    console.log('❓ Seeding questions...');
    await seedQuestions(prisma, users, quizzes);

    console.log('📊 Seeding quiz attempts...');
    await seedQuizAttempts();

    console.log('📈 Seeding evaluations...');
    await seedEvaluations(prisma, users);

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded ${users.length} users, ${profiles.length} profiles, ${courses.length} courses, ${intakes.length} intakes`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
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

export { main as seedDatabase }; 