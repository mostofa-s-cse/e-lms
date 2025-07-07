import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { quizAttemptsAPI } from '../../../services/api';
import { handleApiError } from '../../../utils/sweetAlert';
import { checkPaymentAccess } from '../../../utils/paymentVerification';
import PaymentRequired from '../../../components/PaymentRequired';
import { ArrowLeft, Award, Clock, CheckCircle, XCircle, Calendar, User, BookOpen } from 'lucide-react';

interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalMarks: number;
  isPassed: boolean;
  startedAt: string;
  completedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  quiz?: {
    id: string;
    title: string;
    description?: string;
    totalMarks: number;
    passingMarks: number;
    duration: number;
  };
  answers?: Array<{
    id: string;
    answer: string;
    isCorrect: boolean;
    marksEarned: number;
    question: {
      id: string;
      question: string;
      type: string;
      options?: string[];
      correctAnswer?: string;
      marks: number;
    };
  }>;
}

const QuizAttemptResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (id && user?.id) {
      verifyPaymentAndFetchAttempt();
    }
  }, [id, user?.id]);

  const verifyPaymentAndFetchAttempt = async () => {
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
      
      // Fetch attempt details
      const response = await quizAttemptsAPI.getById(id!);
      const attemptData = (response.data as any).data || response.data;
      
      // Verify this attempt belongs to the current user
      if (attemptData.studentId !== user!.id) {
        handleApiError(new Error('Unauthorized access'), 'You can only view your own quiz attempts');
        navigate('/student/quizzes');
        return;
      }
      
      setAttempt(attemptData as QuizAttempt);
    } catch (error) {
      console.error('Error fetching attempt details:', error);
      handleApiError(error, 'Failed to fetch attempt details');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getScorePercentage = () => {
    if (!attempt) return 0;
    return Math.round((attempt.score / attempt.totalMarks) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'Multiple Choice';
      case 'TRUE_FALSE':
        return 'True/False';
      case 'SHORT_ANSWER':
        return 'Short Answer';
      case 'ESSAY':
        return 'Essay';
      default:
        return type;
    }
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

  if (!attempt) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Quiz attempt not found</p>
      </div>
    );
  }

  const scorePercentage = getScorePercentage();

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
          <h1 className="text-3xl font-bold text-gray-900">Quiz Result</h1>
          <p className="text-gray-600">{attempt.quiz?.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Result Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Result Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{attempt.score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{attempt.totalMarks}</div>
                <div className="text-sm text-gray-600">Total Marks</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(scorePercentage)}`}>
                  {scorePercentage}%
                </div>
                <div className="text-sm text-gray-600">Percentage</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className={`text-2xl font-bold ${attempt.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {attempt.isPassed ? 'PASS' : 'FAIL'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>
          </div>

          {/* Quiz Information */}
          {attempt.quiz && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Quiz Title</p>
                  <p className="font-medium">{attempt.quiz.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{formatDuration(attempt.quiz.duration)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Passing Marks</p>
                  <p className="font-medium">{attempt.quiz.passingMarks} marks</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Passing Percentage</p>
                  <p className="font-medium">
                    {Math.round((attempt.quiz.passingMarks / attempt.quiz.totalMarks) * 100)}%
                  </p>
                </div>
              </div>
              {attempt.quiz.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-900">{attempt.quiz.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Timing Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Started At</p>
                <p className="font-medium">{new Date(attempt.startedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed At</p>
                <p className="font-medium">{new Date(attempt.completedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Question-by-Question Breakdown */}
          {attempt.answers && attempt.answers.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Question-by-Question Breakdown</h3>
              <div className="space-y-6">
                {attempt.answers.map((answer, index) => (
                  <div key={answer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-md font-semibold text-gray-900">
                        Question {index + 1}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {answer.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {answer.marksEarned}/{answer.question.marks} marks
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Question Type</p>
                      <p className="text-sm font-medium">{getQuestionTypeLabel(answer.question.type)}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Question</p>
                      <p className="text-gray-900">{answer.question.question}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Your Answer</p>
                      <p className={`font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {answer.answer || 'No answer provided'}
                      </p>
                    </div>
                    
                    {!answer.isCorrect && answer.question.correctAnswer && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Correct Answer</p>
                        <p className="text-green-600 font-medium">{answer.question.correctAnswer}</p>
                      </div>
                    )}
                    
                    {answer.question.options && answer.question.options.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Options</p>
                        <div className="space-y-1">
                          {answer.question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="text-sm">
                              <span className={`${
                                option === answer.question.correctAnswer ? 'text-green-600 font-medium' : 
                                option === answer.answer ? 'text-red-600 font-medium' : 'text-gray-600'
                              }`}>
                                {String.fromCharCode(65 + optionIndex)}. {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {attempt.student ? `${attempt.student.firstName} ${attempt.student.lastName}` : 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Quiz</p>
                  <p className="font-medium">{attempt.quiz?.title || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Score</span>
                <span className={`font-medium ${getScoreColor(scorePercentage)}`}>
                  {scorePercentage}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  attempt.isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {attempt.isPassed ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Questions Answered</span>
                <span className="font-medium">
                  {attempt.answers?.length || 0} questions
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Correct Answers</span>
                <span className="font-medium text-green-600">
                  {attempt.answers?.filter(a => a.isCorrect).length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/student/quizzes/${attempt.quizId}`)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Back to Quiz
              </button>
              <button
                onClick={() => navigate('/student/quizzes')}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                All Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttemptResultPage; 