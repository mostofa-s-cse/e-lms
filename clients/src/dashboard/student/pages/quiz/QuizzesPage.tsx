import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { studentAPI, enrollmentsAPI, quizzesAPI, quizAttemptsAPI } from '../../../../services/api';
import DataTable from '../../../../pages/DataTable';
import { handleApiError, showInfoAlert } from '../../../../utils/sweetAlert';
import { checkPaymentAccess } from '../../../../utils/paymentVerification';
import PaymentRequiredModal from '../../../../components/PaymentRequiredModal';

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  maxAttempts?: number;
  isActive: boolean;
  courseId: string;
  course?: {
    id: string;
    title: string;
    code: string;
  };
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  questions?: Array<{
    id: string;
    question: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score?: number;
  maxScore?: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  course: {
    id: string;
    title: string;
    code: string;
  };
}

interface QuizzesResponse {
  success: boolean;
  data: Quiz[];
}

interface QuizAttemptsResponse {
  success: boolean;
  data: QuizAttempt[];
}

interface EnrollmentsResponse {
  success: boolean;
  data: Enrollment[];
}

const QuizzesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchCourseQuizzes();
      fetchQuizAttempts();
    }
  }, [user?.id]);

  const fetchCourseQuizzes = async () => {
    try {
      setLoading(true);
      
      // First get student's enrollments to get course IDs
      const enrollmentsResponse = await enrollmentsAPI.getByStudent(user!.id);
      const enrollmentsData = enrollmentsResponse.data as EnrollmentsResponse;
      
      if (enrollmentsData.success && enrollmentsData.data.length > 0) {
        // Get course IDs from enrollments
        const courseIds = enrollmentsData.data.map(enrollment => enrollment.courseId);
        
        // Fetch quizzes for all enrolled courses
        const allQuizzes: Quiz[] = [];
        
        for (const courseId of courseIds) {
          try {
            const quizzesResponse = await quizzesAPI.getByCourse(courseId);
            const quizzesData = quizzesResponse.data as QuizzesResponse;
            if (quizzesData.success && quizzesData.data.length > 0) {
              allQuizzes.push(...quizzesData.data);
            }
          } catch (error) {
            console.error(`Failed to fetch quizzes for course ${courseId}:`, error);
          }
        }
        
        setQuizzes(allQuizzes);
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch course quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizAttempts = async () => {
    try {
      const response = await quizAttemptsAPI.getAll();
      const data = response.data as QuizAttemptsResponse;
      if (data.success) {
        // Filter attempts for current student
        const studentAttempts = data.data.filter(attempt => attempt.studentId === user!.id);
        setQuizAttempts(studentAttempts);
      }
    } catch (error) {
      console.error('Failed to fetch quiz attempts:', error);
    }
  };

  const getQuizAttempts = (quizId: string) => {
    return quizAttempts.filter(attempt => attempt.quizId === quizId);
  };

  const getBestScore = (quizId: string) => {
    const attempts = getQuizAttempts(quizId);
    if (attempts.length === 0) return null;
    
    const completedAttempts = attempts.filter(attempt => attempt.status === 'COMPLETED' && attempt.score !== undefined);
    if (completedAttempts.length === 0) return null;
    
    return Math.max(...completedAttempts.map(attempt => attempt.score!));
  };

  const handleTakeQuiz = async (quiz: Quiz) => {
    // Check if student has already attempted this quiz
    const attempts = getQuizAttempts(quiz.id);
    const completedAttempts = attempts.filter(attempt => attempt.status === 'COMPLETED');
    
    if (completedAttempts.length > 0) {
      await showInfoAlert('Quiz Already Attempted', 'You have already completed this quiz. You can view your results in the quiz details.');
      navigate(`/student/quizzes/${quiz.id}`);
      return;
    }
    
    // Check if there's an in-progress attempt
    const inProgressAttempt = attempts.find(attempt => attempt.status === 'IN_PROGRESS');
    if (inProgressAttempt) {
      await showInfoAlert('Quiz In Progress', 'You have an unfinished attempt for this quiz. Please complete it first.');
      navigate(`/student/quizzes/${quiz.id}`);
      return;
    }
    
    // Navigate to quiz taking page
    navigate(`/student/quizzes/${quiz.id}/take`);
  };

  const handleViewQuiz = async (quiz: Quiz) => {
    if (!user?.id) return;
    
    try {
      const paymentResult = await checkPaymentAccess(user.id);
      if (paymentResult.hasAccess) {
        navigate(`/student/quizzes/${quiz.id}`);
      } else {
        setPaymentMessage(paymentResult.message);
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      setPaymentMessage('Unable to verify payment status. Please contact our support team.');
      setShowPaymentModal(true);
    }
  };

  const handleViewResults = async (quiz: Quiz) => {
    if (!user?.id) return;
    
    try {
      const paymentResult = await checkPaymentAccess(user.id);
      if (paymentResult.hasAccess) {
        // Find the best completed attempt for this quiz
        const attempts = getQuizAttempts(quiz.id);
        const completedAttempts = attempts.filter(attempt => attempt.status === 'COMPLETED');
        
        if (completedAttempts.length > 0) {
          // Navigate to the most recent completed attempt
          const latestAttempt = completedAttempts.sort((a, b) => 
            new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime()
          )[0];
          navigate(`/student/quiz-attempts/${latestAttempt.id}`);
        } else {
          navigate(`/student/quizzes/${quiz.id}`);
        }
      } else {
        setPaymentMessage(paymentResult.message);
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      setPaymentMessage('Unable to verify payment status. Please contact our support team.');
      setShowPaymentModal(true);
    }
  };

  const handleViewQuizResult = async (quiz: Quiz) => {
    if (!user?.id) return;
    
    try {
      const paymentResult = await checkPaymentAccess(user.id);
      if (paymentResult.hasAccess) {
        // Navigate to quiz result page
        navigate(`/student/quizzes/${quiz.id}/result`);
      } else {
        setPaymentMessage(paymentResult.message);
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      setPaymentMessage('Unable to verify payment status. Please contact our support team.');
      setShowPaymentModal(true);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Quiz',
      render: (title: string, quiz: Quiz) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{quiz.duration} minutes</div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (description: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {description}
        </div>
      )
    },
    {
      key: 'course',
      label: 'Course',
      render: (_: any, quiz: Quiz) => (
        <div className="text-sm text-gray-900">
          {quiz.course ? `${quiz.course.code} - ${quiz.course.title}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (_: any, quiz: Quiz) => (
        <div className="text-sm text-gray-900">
          {quiz.author ? `${quiz.author.firstName} ${quiz.author.lastName}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'passingMarks',
      label: 'Passing Score',
      render: (passingMarks: number, quiz: Quiz) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {Math.round((passingMarks / quiz.totalMarks) * 100)}%
        </span>
      )
    },
    {
      key: 'bestScore',
      label: 'Best Score',
      render: (_: any, quiz: Quiz) => {
        const bestScore = getBestScore(quiz.id);
        const attempts = getQuizAttempts(quiz.id);
        
        if (bestScore !== null) {
          return (
            <div>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {bestScore}%
              </span>
              <div className="text-xs text-gray-500">{attempts.length} attempts</div>
            </div>
          );
        } else if (attempts.length > 0) {
          return (
            <div>
              <span className="text-xs text-gray-500">In Progress</span>
              <div className="text-xs text-gray-500">{attempts.length} attempts</div>
            </div>
          );
        } else {
          return <span className="text-xs text-gray-500">Not attempted</span>;
        }
      }
    },
    {
      key: 'questions',
      label: 'Questions',
      render: (_: any, quiz: Quiz) => (
        <span className="text-sm text-gray-900">
          {quiz.questions ? quiz.questions.length : 0} questions
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (isActive: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Available' : 'Unavailable'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, quiz: Quiz) => {
        const attempts = getQuizAttempts(quiz.id);
        const completedAttempts = attempts.filter(attempt => attempt.status === 'COMPLETED');
        const hasCompletedAttempts = completedAttempts.length > 0;
        
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewQuiz(quiz)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details
            </button>
            {hasCompletedAttempts && (
              <button
                onClick={() => handleViewResults(quiz)}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                View Results
              </button>
            )}
            {/* {hasCompletedAttempts && ( */}
              <button
                onClick={() => handleViewQuizResult(quiz)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                View Result
              </button>
            {/* )} */}
          </div>
        );
      }
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <p className="text-gray-600 mt-2">Take quizzes for your enrolled courses</p>
      </div>

      <DataTable
        columns={columns}
        data={quizzes}
        title="Course Quizzes"
        subtitle="Take quizzes for your enrolled courses"
        loading={loading}
      />
      
      <PaymentRequiredModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        message={paymentMessage}
      />
    </div>
  );
};

export default QuizzesPage; 