"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedQuizAttempts = void 0;
const database_1 = require("../utils/database");
const seedQuizAttempts = async () => {
    try {
        console.log('🌱 Seeding quiz attempts...');
        const students = await database_1.prisma.user.findMany({
            where: { role: 'STUDENT' }
        });
        const quizzes = await database_1.prisma.quiz.findMany({
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
        for (const quiz of quizzes) {
            if (quiz.questions.length === 0)
                continue;
            const studentsForThisQuiz = students.filter(() => Math.random() < 0.7);
            for (const student of studentsForThisQuiz) {
                const existingAttempt = await database_1.prisma.quizAttempt.findFirst({
                    where: {
                        quizId: quiz.id,
                        studentId: student.id
                    }
                });
                if (existingAttempt) {
                    console.log(`⚠️  Quiz attempt already exists for student ${student.id} and quiz ${quiz.id}`);
                    continue;
                }
                let totalScore = 0;
                const answers = [];
                const performanceLevel = Math.random();
                let correctAnswerChance = 0.5;
                if (performanceLevel < 0.2) {
                    correctAnswerChance = 0.3;
                }
                else if (performanceLevel < 0.5) {
                    correctAnswerChance = 0.6;
                }
                else if (performanceLevel < 0.8) {
                    correctAnswerChance = 0.8;
                }
                else {
                    correctAnswerChance = 0.95;
                }
                for (const question of quiz.questions) {
                    let studentAnswer = '';
                    let isCorrect = false;
                    if (question.type === 'MULTIPLE_CHOICE' && question.options) {
                        const options = question.options;
                        if (Math.random() < correctAnswerChance) {
                            studentAnswer = question.correctAnswer;
                            isCorrect = true;
                        }
                        else {
                            const wrongOptions = options.filter(opt => opt !== question.correctAnswer);
                            studentAnswer = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
                            isCorrect = false;
                        }
                    }
                    else if (question.type === 'TRUE_FALSE') {
                        if (Math.random() < correctAnswerChance) {
                            studentAnswer = question.correctAnswer;
                            isCorrect = true;
                        }
                        else {
                            studentAnswer = question.correctAnswer === 'True' ? 'False' : 'True';
                            isCorrect = false;
                        }
                    }
                    else {
                        if (Math.random() < correctAnswerChance * 0.8) {
                            studentAnswer = question.correctAnswer;
                            isCorrect = true;
                        }
                        else {
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
                const attempt = await database_1.prisma.quizAttempt.create({
                    data: {
                        studentId: student.id,
                        quizId: quiz.id,
                        score: totalScore,
                        totalMarks: quiz.totalMarks,
                        isPassed,
                        startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
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
    }
    catch (error) {
        console.error('❌ Error seeding quiz attempts:', error);
    }
};
exports.seedQuizAttempts = seedQuizAttempts;
//# sourceMappingURL=quizAttempts.js.map