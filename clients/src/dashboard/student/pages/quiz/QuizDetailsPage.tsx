import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { quizzesAPI, quizAttemptsAPI, enrollmentsAPI } from '../../../../services/api';
import { handleApiError, showSuccessAlert, showInfoAlert } from '../../../../utils/sweetAlert';
import { checkPaymentAccess } from '../../../../utils/paymentVerification';
import PaymentRequired from '../../../../components/PaymentRequired';
import { ArrowLeft, Clock, User, BookOpen, Play, Award, Calendar, CheckCircle, XCircle } from 'lucide-react';


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
    description: string;
    credits: number;
  };
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  questions?: Array<{
    id: string;
    question: string;
    type: string;
    options?: string[];
    correctAnswer?: string;
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
  answers?: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
  }>;
}

interface Enrollment {
  id: string;
  status: string;
  enrolledAt: string;
  intake?: {
    id: string;
    name: string;
    amount: number;
  };
}

const QuizDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (id && user?.id) {
      verifyPaymentAndFetchQuizDetails();
    }
  }, [id, user?.id]);

  const verifyPaymentAndFetchQuizDetails = async () => {
    try {
      setLoading(true);
      
      // First verify payment access
      const paymentResult = await checkPaymentAccess(user!.id);
      if (!paymentResult.hasAccess) {
        setPaymentVerified(false);
        setLoading(false);
        return;
      }
      
      setPaymentVerified(true);
      
      // Fetch quiz details
      const quizResponse = await quizzesAPI.getById(id!);
      const quizData = (quizResponse.data as any).data || quizResponse.data;
      setQuiz(quizData as Quiz);

      // Fetch quiz attempts for this student
      try {
        const attemptsResponse = await quizAttemptsAPI.getAll();
        const attemptsData = (attemptsResponse.data as any).data || attemptsResponse.data;
        const studentAttempts = attemptsData.filter((attempt: QuizAttempt) => 
          attempt.quizId === id && attempt.studentId === user!.id
        );
        setQuizAttempts(studentAttempts);
      } catch (error) {
        console.error('Failed to fetch quiz attempts:', error);
        setQuizAttempts([]);
      }

      // Fetch enrollment info for this course
      if (quizData.courseId) {
        try {
          const enrollmentResponse = await enrollmentsAPI.getByStudentAndCourse(user!.id, quizData.courseId);
          const enrollmentData = (enrollmentResponse.data as any).data || enrollmentResponse.data;
          setEnrollment(enrollmentData as Enrollment);
        } catch (error) {
          console.log('No enrollment found for this course');
        }
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      handleApiError(error, 'Failed to fetch quiz details');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const getBestScore = () => {
    if (quizAttempts.length === 0) return null;
    
    const completedAttempts = quizAttempts.filter(attempt => 
      attempt.status === 'COMPLETED' && attempt.score !== undefined
    );
    if (completedAttempts.length === 0) return null;
    
    return Math.max(...completedAttempts.map(attempt => attempt.score!));
  };

  const getAttemptsCount = () => {
    return quizAttempts.length;
  };

  const getPassingPercentage = () => {
    if (!quiz) return 0;
    return Math.round((quiz.passingMarks / quiz.totalMarks) * 100);
  };

  const handleTakeQuiz = () => {
    if (!quiz?.isActive) {
      showInfoAlert('Quiz Unavailable', 'This quiz is currently not available.');
      return;
    }
    
    // Check if student has already attempted this quiz
    const completedAttempts = quizAttempts.filter(attempt => attempt.status === 'COMPLETED');
    
    if (completedAttempts.length > 0) {
      showInfoAlert('Quiz Already Attempted', 'You have already completed this quiz. You can view your results below.');
      return;
    }
    
    // Check if there's an in-progress attempt
    const inProgressAttempt = quizAttempts.find(attempt => attempt.status === 'IN_PROGRESS');
    if (inProgressAttempt) {
      showInfoAlert('Quiz In Progress', 'You have an unfinished attempt for this quiz. Please complete it first.');
      return;
    }
    
    // Check if max attempts reached
    if (quiz.maxAttempts && quizAttempts.length >= quiz.maxAttempts) {
      showInfoAlert('Max Attempts Reached', `You have reached the maximum number of attempts (${quiz.maxAttempts}) for this quiz.`);
      return;
    }
    
    // Navigate to quiz taking page
    navigate(`/student/quizzes/${quiz.id}/take`);
  };

  const handleViewAttempt = (attemptId: string) => {
    navigate(`/student/quiz-attempts/${attemptId}`);
  };

  const handleViewResult = (attemptId: string) => {
    navigate(`/student/quiz-attempts/${attemptId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScorePercentage = (score: number, totalMarks: number) => {
    return Math.round((score / totalMarks) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show payment required if payment is not verified
  if (!paymentVerified) {
    return (
      <PaymentRequired 
        message="You need to complete your payment to access course content. Please contact our support team for assistance."
        showContactInfo={true}
      />
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Quiz not found</p>
      </div>
    );
  }

  const bestScore = getBestScore();
  const attemptsCount = getAttemptsCount();
  const passingPercentage = getPassingPercentage();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/student/quizzes')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Quizzes</span>
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{quiz.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Quiz Description */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{quiz.description}</p>
          </div>

          {/* Quiz Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Quiz Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{formatDuration(quiz.duration)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Marks</p>
                  <p className="font-medium">{quiz.totalMarks} marks</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Passing Score</p>
                  <p className="font-medium">{quiz.passingMarks} marks ({passingPercentage}%)</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Questions</p>
                  <p className="font-medium">{quiz.questions ? quiz.questions.length : 0} questions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Information */}
          {quiz.course && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Course Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Course Code</p>
                  <p className="font-medium">{quiz.course.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Credits</p>
                  <p className="font-medium">{quiz.course.credits} credits</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Course Description</p>
                  <p className="font-medium text-sm">{quiz.course.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Attempts History */}
          {quizAttempts.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Your Attempts</h3>
              <div className="space-y-3">
                {quizAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(attempt.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            Attempt #{quizAttempts.indexOf(attempt) + 1}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(attempt.startedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(attempt.status)}`}>
                          {attempt.status}
                        </span>
                        {attempt.score !== undefined && (
                          <div className="mt-1">
                            <p className="text-sm font-medium text-gray-900">
                              {attempt.score}/{attempt.maxScore || quiz.totalMarks} marks
                            </p>
                            <p className={`text-xs font-medium ${getScoreColor(getScorePercentage(attempt.score, attempt.maxScore || quiz.totalMarks))}`}>
                              {getScorePercentage(attempt.score, attempt.maxScore || quiz.totalMarks)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-3 flex space-x-2">
                      {attempt.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleViewResult(attempt.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          View Result
                        </button>
                      )}
                      <button
                        onClick={() => handleViewAttempt(attempt.id)}
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quiz Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {quiz.isActive ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Best Score</span>
                <span className="font-medium">
                  {bestScore !== null ? `${bestScore}%` : 'Not attempted'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Attempts</span>
                <span className="font-medium">{attemptsCount}</span>
              </div>

              {quiz.maxAttempts && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Max Attempts</span>
                  <span className="font-medium">{quiz.maxAttempts}</span>
                </div>
              )}
            </div>
          </div>

          {/* Author Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Author Information</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Author</p>
                  <p className="font-medium">
                    {quiz.author ? `${quiz.author.firstName} ${quiz.author.lastName}` : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{new Date(quiz.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Enrollment Status */}
          {enrollment && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Enrollment Status</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {enrollment.status}
                  </span>
                </div>
                {enrollment.intake && (
                  <div>
                    <p className="text-sm text-gray-600">Intake</p>
                    <p className="font-medium">{enrollment.intake.name}</p>
                    <p className="text-xs text-gray-500">BDT {enrollment.intake.amount}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Enrolled</p>
                  <p className="font-medium">{new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              {quiz.isActive && (
                <button
                  onClick={handleTakeQuiz}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Take Quiz
                </button>
              )}
              
              {quiz.course && (
                <button
                  onClick={() => navigate(`/student/courses/${quiz.courseId}`)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Course
                </button>
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/student/quizzes')}
                className="w-full text-left text-blue-600 hover:text-blue-800 text-sm py-2"
              >
                ← Back to Quizzes
              </button>
              {quiz.course && (
                <button
                  onClick={() => navigate(`/student/courses/${quiz.courseId}`)}
                  className="w-full text-left text-blue-600 hover:text-blue-800 text-sm py-2"
                >
                  ← Back to Course
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailsPage; 