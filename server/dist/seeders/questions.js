"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedQuestions = seedQuestions;
const client_1 = require("@prisma/client");
async function seedQuestions(prisma, users, quizzes) {
    const teachers = users.filter(user => user.role === client_1.UserRole.TEACHER);
    const questionsData = [
        {
            question: 'What is a variable in programming?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['A container for storing data', 'A type of function', 'A programming language', 'A computer component'],
            correctAnswer: 'A container for storing data',
            marks: 2,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Programming Fundamentals Quiz')?.id,
            authorId: teachers[0].id
        },
        {
            question: 'Which of the following is a valid variable name in most programming languages?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['123variable', '_myVariable', '@variable', '#variable'],
            correctAnswer: '_myVariable',
            marks: 2,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Programming Fundamentals Quiz')?.id,
            authorId: teachers[0].id
        },
        {
            question: 'A loop that continues until a condition becomes false is called a:',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['For loop', 'While loop', 'If statement', 'Switch statement'],
            correctAnswer: 'While loop',
            marks: 2,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Programming Fundamentals Quiz')?.id,
            authorId: teachers[0].id
        },
        {
            question: 'Programming is the process of creating instructions for computers to follow.',
            type: client_1.QuestionType.TRUE_FALSE,
            options: ['true', 'false'],
            correctAnswer: 'true',
            marks: 1,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Programming Fundamentals Quiz')?.id,
            authorId: teachers[0].id
        },
        {
            question: 'Explain the difference between a variable and a constant in programming.',
            type: client_1.QuestionType.SHORT_ANSWER,
            options: [],
            correctAnswer: 'A variable can change its value during program execution, while a constant maintains the same value throughout the program.',
            marks: 5,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Programming Fundamentals Quiz')?.id,
            authorId: teachers[0].id
        },
        {
            question: 'What is the derivative of x²?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['x', '2x', 'x²', '2x²'],
            correctAnswer: '2x',
            marks: 3,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Calculus Basics Quiz')?.id,
            authorId: teachers[1].id
        },
        {
            question: 'The limit of a function as x approaches a exists if the left and right limits are equal.',
            type: client_1.QuestionType.TRUE_FALSE,
            options: ['true', 'false'],
            correctAnswer: 'true',
            marks: 2,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Calculus Basics Quiz')?.id,
            authorId: teachers[1].id
        },
        {
            question: 'What is the derivative of sin(x)?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'],
            correctAnswer: 'cos(x)',
            marks: 3,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Calculus Basics Quiz')?.id,
            authorId: teachers[1].id
        },
        {
            question: 'Which management function involves setting goals and determining how to achieve them?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['Planning', 'Organizing', 'Leading', 'Controlling'],
            correctAnswer: 'Planning',
            marks: 2,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Management Principles Quiz')?.id,
            authorId: teachers[2].id
        },
        {
            question: 'Autocratic leadership style involves making decisions without consulting team members.',
            type: client_1.QuestionType.TRUE_FALSE,
            options: ['true', 'false'],
            correctAnswer: 'true',
            marks: 1,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Management Principles Quiz')?.id,
            authorId: teachers[2].id
        },
        {
            question: 'Describe the difference between leadership and management.',
            type: client_1.QuestionType.SHORT_ANSWER,
            options: [],
            correctAnswer: 'Management focuses on planning, organizing, and controlling resources, while leadership focuses on inspiring and motivating people toward a vision.',
            marks: 5,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Management Principles Quiz')?.id,
            authorId: teachers[2].id
        },
        {
            question: 'What is market segmentation?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['Dividing a market into distinct groups', 'Setting product prices', 'Creating advertisements', 'Managing inventory'],
            correctAnswer: 'Dividing a market into distinct groups',
            marks: 2,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Marketing Strategy Assessment')?.id,
            authorId: teachers[2].id
        },
        {
            question: 'The 4Ps of marketing include Product, Price, Place, and Promotion.',
            type: client_1.QuestionType.TRUE_FALSE,
            options: ['true', 'false'],
            correctAnswer: 'true',
            marks: 1,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Marketing Strategy Assessment')?.id,
            authorId: teachers[2].id
        },
        {
            question: 'What is a metaphor?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['A direct comparison between two things', 'A word that sounds like what it means', 'A repeated sound at the beginning of words', 'A comparison using like or as'],
            correctAnswer: 'A direct comparison between two things',
            marks: 2,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Literary Analysis Quiz')?.id,
            authorId: teachers[3].id
        },
        {
            question: 'Shakespeare wrote primarily in iambic pentameter.',
            type: client_1.QuestionType.TRUE_FALSE,
            options: ['true', 'false'],
            correctAnswer: 'true',
            marks: 1,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Literary Analysis Quiz')?.id,
            authorId: teachers[3].id
        },
        {
            question: 'Explain the concept of dramatic irony in literature.',
            type: client_1.QuestionType.SHORT_ANSWER,
            options: [],
            correctAnswer: 'Dramatic irony occurs when the audience knows something that the characters in the story do not know.',
            marks: 4,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Literary Analysis Quiz')?.id,
            authorId: teachers[3].id
        },
        {
            question: 'What is Newton\'s First Law also known as?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['Law of Action and Reaction', 'Law of Inertia', 'Law of Acceleration', 'Law of Motion'],
            correctAnswer: 'Law of Inertia',
            marks: 2,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Newton\'s Laws Quiz')?.id,
            authorId: teachers[4].id
        },
        {
            question: 'Force equals mass times acceleration.',
            type: client_1.QuestionType.TRUE_FALSE,
            options: ['true', 'false'],
            correctAnswer: 'true',
            marks: 1,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Newton\'s Laws Quiz')?.id,
            authorId: teachers[4].id
        },
        {
            question: 'What is the SI unit of force?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['Joule', 'Watt', 'Newton', 'Pascal'],
            correctAnswer: 'Newton',
            marks: 2,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Newton\'s Laws Quiz')?.id,
            authorId: teachers[4].id
        },
        {
            question: 'You should always wear safety goggles in the laboratory.',
            type: client_1.QuestionType.TRUE_FALSE,
            options: ['true', 'false'],
            correctAnswer: 'true',
            marks: 1,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Chemistry Lab Safety Quiz')?.id,
            authorId: teachers[4].id
        },
        {
            question: 'What should you do if you spill a chemical on your skin?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['Wipe it off with a paper towel', 'Rinse with water for 15 minutes', 'Ignore it', 'Rub it in'],
            correctAnswer: 'Rinse with water for 15 minutes',
            marks: 2,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Chemistry Lab Safety Quiz')?.id,
            authorId: teachers[4].id
        },
        {
            question: 'Which data structure operates on a LIFO basis?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['Queue', 'Stack', 'Linked List', 'Array'],
            correctAnswer: 'Stack',
            marks: 3,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Data Structures Midterm')?.id,
            authorId: teachers[0].id
        },
        {
            question: 'A linked list consists of nodes connected by pointers.',
            type: client_1.QuestionType.TRUE_FALSE,
            options: ['true', 'false'],
            correctAnswer: 'true',
            marks: 1,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Data Structures Midterm')?.id,
            authorId: teachers[0].id
        },
        {
            question: 'What does HTML stand for?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
            correctAnswer: 'Hyper Text Markup Language',
            marks: 2,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Web Development Final')?.id,
            authorId: teachers[0].id
        },
        {
            question: 'CSS is used for styling web pages.',
            type: client_1.QuestionType.TRUE_FALSE,
            options: ['true', 'false'],
            correctAnswer: 'true',
            marks: 1,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Web Development Final')?.id,
            authorId: teachers[0].id
        },
        {
            question: 'What is the mean of the numbers 2, 4, 6, 8, 10?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['5', '6', '7', '8'],
            correctAnswer: '6',
            marks: 3,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Statistics Final Exam')?.id,
            authorId: teachers[1].id
        },
        {
            question: 'The median is the middle value in a sorted dataset.',
            type: client_1.QuestionType.TRUE_FALSE,
            options: ['true', 'false'],
            correctAnswer: 'true',
            marks: 1,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Statistics Final Exam')?.id,
            authorId: teachers[1].id
        },
        {
            question: 'What is the accounting equation?',
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            options: ['Assets = Liabilities + Equity', 'Assets = Liabilities - Equity', 'Assets + Liabilities = Equity', 'Assets - Liabilities = Equity'],
            correctAnswer: 'Assets = Liabilities + Equity',
            marks: 3,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Financial Accounting Quiz')?.id,
            authorId: teachers[2].id
        },
        {
            question: 'Debits increase asset accounts.',
            type: client_1.QuestionType.TRUE_FALSE,
            options: ['true', 'false'],
            correctAnswer: 'true',
            marks: 1,
            isActive: true,
            quizId: quizzes.find(q => q.title === 'Financial Accounting Quiz')?.id,
            authorId: teachers[2].id
        }
    ];
    const questions = await Promise.all(questionsData.map(questionData => prisma.question.create({
        data: questionData
    })));
    console.log(`✅ Created ${questions.length} questions`);
    return questions;
}
//# sourceMappingURL=questions.js.map