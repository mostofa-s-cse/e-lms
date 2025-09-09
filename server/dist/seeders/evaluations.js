"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedEvaluations = seedEvaluations;
const client_1 = require("@prisma/client");
async function seedEvaluations(prisma, users) {
    const students = users.filter(user => user.role === client_1.UserRole.STUDENT);
    const teachers = users.filter(user => user.role === client_1.UserRole.TEACHER);
    const courses = await prisma.course.findMany();
    if (courses.length === 0) {
        console.log('⚠️ No courses found. Skipping evaluation seeding.');
        return [];
    }
    const evaluationsData = [
        {
            title: 'Programming Fundamentals Assignment',
            description: 'Evaluation of basic programming concepts implementation including variables, loops, and functions.',
            type: client_1.EvaluationType.ASSIGNMENT,
            score: 85.5,
            maxScore: 100,
            feedback: 'Excellent work on implementing the basic concepts. Good use of variables and control structures. Consider adding more comments to improve code readability.',
            studentId: students[0].id,
            evaluatorId: teachers[0].id
        },
        {
            title: 'Data Structures Project',
            description: 'Assessment of linked list and stack implementation with proper documentation.',
            type: client_1.EvaluationType.PROJECT,
            score: 92.0,
            maxScore: 100,
            feedback: 'Outstanding implementation of data structures. Excellent documentation and error handling. The code is well-organized and follows best practices.',
            studentId: students[0].id,
            evaluatorId: teachers[0].id
        },
        {
            title: 'Web Development Portfolio',
            description: 'Evaluation of responsive web application with HTML, CSS, and JavaScript.',
            type: client_1.EvaluationType.PROJECT,
            score: 78.5,
            maxScore: 100,
            feedback: 'Good understanding of web technologies. The design is responsive but could benefit from more advanced CSS techniques. JavaScript functionality works well.',
            studentId: students[1].id,
            evaluatorId: teachers[0].id
        },
        {
            title: 'Calculus Problem Set',
            description: 'Assessment of derivative and integral calculations with applications.',
            type: client_1.EvaluationType.ASSIGNMENT,
            score: 88.0,
            maxScore: 100,
            feedback: 'Strong mathematical reasoning and accurate calculations. Good understanding of derivative rules. Work on improving presentation of solutions.',
            studentId: students[3].id,
            evaluatorId: teachers[1].id
        },
        {
            title: 'Linear Algebra Presentation',
            description: 'Oral presentation on matrix operations and their applications.',
            type: client_1.EvaluationType.PROJECT,
            score: 82.5,
            maxScore: 100,
            feedback: 'Clear presentation of concepts with good examples. Could improve on explaining the practical applications. Good use of visual aids.',
            studentId: students[4].id,
            evaluatorId: teachers[1].id
        },
        {
            title: 'Statistics Research Project',
            description: 'Data analysis project using statistical methods and hypothesis testing.',
            type: client_1.EvaluationType.PROJECT,
            score: 90.0,
            maxScore: 100,
            feedback: 'Excellent statistical analysis with proper methodology. Clear presentation of results and conclusions. Well-written report with appropriate citations.',
            studentId: students[3].id,
            evaluatorId: teachers[1].id
        },
        {
            title: 'Management Case Study Analysis',
            description: 'Analysis of organizational behavior and management principles in a real-world scenario.',
            type: client_1.EvaluationType.ASSIGNMENT,
            score: 85.0,
            maxScore: 100,
            feedback: 'Good analysis of the case study with appropriate application of management theories. Consider exploring alternative solutions more thoroughly.',
            studentId: students[6].id,
            evaluatorId: teachers[2].id
        },
        {
            title: 'Marketing Strategy Presentation',
            description: 'Group presentation on developing a comprehensive marketing strategy for a new product.',
            type: client_1.EvaluationType.PROJECT,
            score: 87.5,
            maxScore: 100,
            feedback: 'Excellent teamwork and presentation skills. The marketing strategy is well-researched and comprehensive. Good use of market analysis data.',
            studentId: students[7].id,
            evaluatorId: teachers[2].id
        },
        {
            title: 'Financial Statement Analysis',
            description: 'Evaluation of financial statements and ratio analysis for a company.',
            type: client_1.EvaluationType.ASSIGNMENT,
            score: 91.0,
            maxScore: 100,
            feedback: 'Outstanding financial analysis with accurate calculations and insightful interpretations. Excellent understanding of accounting principles.',
            studentId: students[6].id,
            evaluatorId: teachers[2].id
        },
        {
            title: 'HR Management Simulation',
            description: 'Participation in human resource management simulation exercises.',
            type: client_1.EvaluationType.PARTICIPATION,
            score: 88.0,
            maxScore: 100,
            feedback: 'Active participation in all simulation activities. Good decision-making skills in HR scenarios. Shows strong understanding of HR principles.',
            studentId: students[8].id,
            evaluatorId: teachers[2].id
        },
        {
            title: 'Literary Analysis Essay',
            description: 'Critical analysis of a selected literary work with proper thesis and supporting evidence.',
            type: client_1.EvaluationType.ASSIGNMENT,
            score: 86.5,
            maxScore: 100,
            feedback: 'Strong analytical skills with well-developed arguments. Good use of textual evidence. Consider exploring alternative interpretations.',
            studentId: students[9].id,
            evaluatorId: teachers[3].id
        },
        {
            title: 'Creative Writing Portfolio',
            description: 'Collection of creative writing pieces including short stories and poetry.',
            type: client_1.EvaluationType.PROJECT,
            score: 89.0,
            maxScore: 100,
            feedback: 'Excellent creative writing with strong character development and vivid imagery. The poetry shows good use of literary devices. Well-crafted narratives.',
            studentId: students[10].id,
            evaluatorId: teachers[3].id
        },
        {
            title: 'Class Participation and Discussion',
            description: 'Evaluation of active participation in literary discussions and critical thinking.',
            type: client_1.EvaluationType.PARTICIPATION,
            score: 84.0,
            maxScore: 100,
            feedback: 'Consistent participation in class discussions with thoughtful contributions. Good critical thinking skills and respectful engagement with peers.',
            studentId: students[11].id,
            evaluatorId: teachers[3].id
        },
        {
            title: 'Physics Laboratory Report',
            description: 'Scientific report on Newton\'s laws experiment with data analysis and conclusions.',
            type: client_1.EvaluationType.ASSIGNMENT,
            score: 87.0,
            maxScore: 100,
            feedback: 'Well-conducted experiment with accurate data collection. Good analysis of results and proper error discussion. Clear and concise report writing.',
            studentId: students[12].id,
            evaluatorId: teachers[4].id
        },
        {
            title: 'Energy Conservation Project',
            description: 'Research project on energy conservation principles and real-world applications.',
            type: client_1.EvaluationType.PROJECT,
            score: 83.5,
            maxScore: 100,
            feedback: 'Good research on energy conservation concepts. The project demonstrates understanding of theoretical principles. Could include more practical applications.',
            studentId: students[13].id,
            evaluatorId: teachers[4].id
        },
        {
            title: 'Laboratory Safety and Procedures',
            description: 'Assessment of laboratory safety practices and experimental procedure following.',
            type: client_1.EvaluationType.PARTICIPATION,
            score: 95.0,
            maxScore: 100,
            feedback: 'Excellent adherence to safety protocols. Consistently follows proper laboratory procedures. Sets a good example for other students.',
            studentId: students[14].id,
            evaluatorId: teachers[4].id
        },
        {
            title: 'Digital Electronics Design',
            description: 'Design and implementation of digital circuits using logic gates.',
            type: client_1.EvaluationType.PROJECT,
            score: 89.5,
            maxScore: 100,
            feedback: 'Excellent circuit design with proper use of logic gates. Good documentation and testing procedures. Shows strong understanding of digital electronics.',
            studentId: students[12].id,
            evaluatorId: teachers[4].id
        },
        {
            title: 'Database Design Project',
            description: 'Complete database design and implementation with ER diagrams and SQL queries.',
            type: client_1.EvaluationType.PROJECT,
            score: 91.5,
            maxScore: 100,
            feedback: 'Outstanding database design with proper normalization. Excellent ER diagrams and well-written SQL queries. Comprehensive documentation.',
            studentId: students[3].id,
            evaluatorId: teachers[0].id
        },
        {
            title: 'Programming Assignment - Variables and Loops',
            description: 'Basic programming assignment focusing on variable usage and loop structures.',
            type: client_1.EvaluationType.ASSIGNMENT,
            score: 76.0,
            maxScore: 100,
            feedback: 'Good understanding of basic concepts. Some issues with loop logic. Consider reviewing the loop conditions and variable scope.',
            studentId: students[2].id,
            evaluatorId: teachers[0].id
        },
        {
            title: 'Business Management Case Study',
            description: 'Analysis of leadership styles and organizational behavior in a business scenario.',
            type: client_1.EvaluationType.ASSIGNMENT,
            score: 79.0,
            maxScore: 100,
            feedback: 'Good analysis of the case study. Shows understanding of management concepts. Could provide more specific recommendations.',
            studentId: students[8].id,
            evaluatorId: teachers[2].id
        },
        {
            title: 'Physics Problem Solving',
            description: 'Assessment of problem-solving skills in mechanics and energy conservation.',
            type: client_1.EvaluationType.ASSIGNMENT,
            score: 81.0,
            maxScore: 100,
            feedback: 'Good problem-solving approach with correct use of formulas. Some calculation errors. Work on double-checking mathematical operations.',
            studentId: students[14].id,
            evaluatorId: teachers[4].id
        }
    ];
    const evaluationsWithCourseId = evaluationsData.map((evaluation, index) => ({
        ...evaluation,
        courseId: courses[index % courses.length].id
    }));
    const evaluations = await Promise.all(evaluationsWithCourseId.map(evaluationData => prisma.evaluation.create({
        data: evaluationData
    })));
    console.log(`✅ Created ${evaluations.length} evaluations`);
    return evaluations;
}
//# sourceMappingURL=evaluations.js.map