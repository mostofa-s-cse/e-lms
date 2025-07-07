import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { quizzesAPI, quizAttemptsAPI } from '../../../../services/api';
import { handleApiError } from '../../../../utils/sweetAlert';
import { checkPaymentAccess } from '../../../../utils/paymentVerification';
import PaymentRequired from '../../../../components/PaymentRequired';
import { ArrowLeft, Award, Clock, CheckCircle, XCircle, Calendar, User, BookOpen, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const QuizResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (id && user?.id) {
      verifyPaymentAndFetchData();
    }
  }, [id, user?.id]);

  const verifyPaymentAndFetchData = async () => {
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
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      handleApiError(error, 'Failed to fetch quiz details');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
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

  const getScorePercentage = (score: number, totalMarks: number) => {
    return Math.round((score / totalMarks) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
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

  const handleViewDetailedResult = (attemptId: string) => {
    navigate(`/student/quiz-attempts/${attemptId}`);
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
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
          <p className="text-gray-600">{quiz.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Quiz Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Quiz Title</p>
                <p className="font-medium">{quiz.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{quiz.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Marks</p>
                <p className="font-medium">{quiz.totalMarks} marks</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Passing Score</p>
                <p className="font-medium">{quiz.passingMarks} marks ({passingPercentage}%)</p>
              </div>
            </div>
            {quiz.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900">{quiz.description}</p>
              </div>
            )}
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{attemptsCount}</div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {quizAttempts.filter(a => a.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className={`text-2xl font-bold ${bestScore !== null ? getScoreColor(getScorePercentage(bestScore, quiz.totalMarks)) : 'text-gray-400'}`}>
                  {bestScore !== null ? `${getScorePercentage(bestScore, quiz.totalMarks)}%` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className={`text-2xl font-bold ${bestScore !== null && bestScore >= quiz.passingMarks ? 'text-green-600' : 'text-red-600'}`}>
                  {bestScore !== null ? (bestScore >= quiz.passingMarks ? 'PASS' : 'FAIL') : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>
          </div>

          {/* Quiz Attempts History */}
          {quizAttempts.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Attempts</h3>
              <div className="space-y-4">
                {quizAttempts.map((attempt, index) => (
                  <div
                    key={attempt.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(attempt.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            Attempt #{index + 1}
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
                          onClick={() => handleViewDetailedResult(attempt.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Detailed Result
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Attempts Yet</h3>
                <p className="text-gray-600 mb-4">You haven't attempted this quiz yet.</p>
                <Link
                  to={`/student/quizzes/${quiz.id}/take`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Take Quiz
                </Link>
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
                  {bestScore !== null ? `${getScorePercentage(bestScore, quiz.totalMarks)}%` : 'Not attempted'}
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

          {/* Course Information */}
          {quiz.course && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Course Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium">{quiz.course.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Course Code</p>
                  <p className="font-medium">{quiz.course.code}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/student/quizzes/${quiz.id}`)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Quiz Details
              </button>
              
              {quiz.isActive && (
                <button
                  onClick={() => navigate(`/student/quizzes/${quiz.id}/take`)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Take Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage; 