import { prisma } from '../utils/database';

export const seedQuizAttempts = async () => {
  try {
    console.log('🌱 Seeding quiz attempts...');

    // Get all existing students, quizzes, and questions
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' }
    });

    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: {
          where: { isActive: true }
        }
      }
    });

    if (students.length === 0 || quizzes.length === 0) {
      console.log('⚠️  No students or quizzes found. Skipping quiz attempts seeding.');
      return;
    }

    // Create quiz attempts with answers
    for (const quiz of quizzes) {
      if (quiz.questions.length === 0) continue;

      // For each quiz, create attempts for a random subset of students (60-80% of students)
      const studentsForThisQuiz = students.filter(() => Math.random() < 0.7);
      
      for (const student of studentsForThisQuiz) {
        // Check if attempt already exists
        const existingAttempt = await prisma.quizAttempt.findFirst({
          where: {
            quizId: quiz.id,
            studentId: student.id
          }
        });

        if (existingAttempt) {
          console.log(`⚠️  Quiz attempt already exists for student ${student.id} and quiz ${quiz.id}`);
          continue;
        }

        // Calculate score and create answers
        let totalScore = 0;
        const answers = [];

        // Determine student performance level for this attempt (affects all questions)
        const performanceLevel = Math.random();
        let correctAnswerChance = 0.5; // Base 50% chance
        
        if (performanceLevel < 0.2) {
          correctAnswerChance = 0.3; // Poor performance (30% chance)
        } else if (performanceLevel < 0.5) {
          correctAnswerChance = 0.6; // Average performance (60% chance)
        } else if (performanceLevel < 0.8) {
          correctAnswerChance = 0.8; // Good performance (80% chance)
        } else {
          correctAnswerChance = 0.95; // Excellent performance (95% chance)
        }

        for (const question of quiz.questions) {
          // Simulate student answers based on performance level
          let studentAnswer = '';
          let isCorrect = false;

          if (question.type === 'MULTIPLE_CHOICE' && question.options) {
            const options = question.options as string[];
            if (Math.random() < correctAnswerChance) {
              studentAnswer = question.correctAnswer;
              isCorrect = true;
            } else {
              // Pick a wrong answer
              const wrongOptions = options.filter(opt => opt !== question.correctAnswer);
              studentAnswer = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
              isCorrect = false;
            }
          } else if (question.type === 'TRUE_FALSE') {
            if (Math.random() < correctAnswerChance) {
              studentAnswer = question.correctAnswer;
              isCorrect = true;
            } else {
              studentAnswer = question.correctAnswer === 'True' ? 'False' : 'True';
              isCorrect = false;
            }
          } else {
            // For short answer and essay, simulate some correct answers
            if (Math.random() < correctAnswerChance * 0.8) { // Slightly harder for text answers
              studentAnswer = question.correctAnswer;
              isCorrect = true;
            } else {
              studentAnswer = 'Incorrect answer';
              isCorrect = false;
            }
          }

          const marksEarned = isCorrect ? question.marks : 0;
          totalScore += marksEarned;

          answers.push({
            answer: studentAnswer,
            isCorrect,
            marksEarned,
            questionId: question.id
          });
        }

        const isPassed = totalScore >= quiz.passingMarks;

        // Create the quiz attempt with answers
        const attempt = await prisma.quizAttempt.create({
          data: {
            studentId: student.id,
            quizId: quiz.id,
            score: totalScore,
            totalMarks: quiz.totalMarks,
            isPassed,
            startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
            completedAt: new Date(),
            answers: {
              create: answers
            }
          }
        });

        console.log(`✅ Created quiz attempt ${attempt.id} for student ${student.firstName} ${student.lastName} on quiz "${quiz.title}" - Score: ${totalScore}/${quiz.totalMarks} (${isPassed ? 'PASSED' : 'FAILED'})`);
      }
    }

    console.log('✅ Quiz attempts seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding quiz attempts:', error);
  }
}; 