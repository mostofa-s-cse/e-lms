import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { quizzesAPI, quizAttemptsAPI, questionsAPI } from '../../../../services/api';
import { handleApiError, showSuccessAlert, showConfirmDialog } from '../../../../utils/sweetAlert';
import { checkPaymentAccess } from '../../../../utils/paymentVerification';
import PaymentRequired from '../../../../components/PaymentRequired';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Timer } from 'lucide-react';


interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  isActive: boolean;
  courseId: string;
  course?: {
    id: string;
    title: string;
    code: string;
  };
  questions?: Array<{
    id: string;
    question: string;
    type: string;
    options?: string[];
    correctAnswer?: string;
    marks: number;
  }>;
  createdAt: string;
}

interface QuizAnswer {
  questionId: string;
  answer: string;
}

const QuizTakingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (id && user?.id) {
      verifyPaymentAndFetchQuiz();
    }
  }, [id, user?.id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const verifyPaymentAndFetchQuiz = async () => {
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
      
      // Fetch quiz details with questions
      const quizResponse = await quizzesAPI.getById(id!);
      const quizData = (quizResponse.data as any).data || quizResponse.data;
      
      // If quiz doesn't have questions, fetch them separately
      if (!quizData.questions || quizData.questions.length === 0) {
        console.log('Quiz has no questions, fetching questions separately');
        try {
          const questionsResponse = await questionsAPI.getByQuiz(id!);
          const questionsData = (questionsResponse.data as any).data || questionsResponse.data;
          quizData.questions = questionsData;
        } catch (error) {
          console.error('Failed to fetch questions:', error);
        }
      }
      
      console.log('Quiz data with questions:', quizData);
      setQuiz(quizData as Quiz);
      
      if (quizData.duration) {
        setTimeLeft(quizData.duration * 60); // Convert minutes to seconds
      }
      
      setStartTime(new Date());
    } catch (error) {
      console.error('Error fetching quiz:', error);
      handleApiError(error, 'Failed to fetch quiz');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      if (existingIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = { questionId, answer };
        return newAnswers;
      } else {
        return [...prev, { questionId, answer }];
      }
    });
  };

  const getCurrentAnswer = (questionId: string) => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.answer || '';
  };

  const handleNextQuestion = () => {
    if (quiz?.questions && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    
    if (answers.length === 0) {
      await handleApiError(new Error('No answers provided'), 'Please answer at least one question before submitting');
      return;
    }
    
    const unansweredQuestions = quiz.questions?.filter(q => !answers.find(a => a.questionId === q.id));
    if (unansweredQuestions && unansweredQuestions.length > 0) {
      const confirmed = await showConfirmDialog(
        'Unanswered Questions',
        `You have ${unansweredQuestions.length} unanswered question(s). Are you sure you want to submit the quiz?`,
        'Submit Anyway',
        'Continue Answering'
      );
      if (!confirmed.isConfirmed) return;
    }

    const confirmed = await showConfirmDialog(
      'Submit Quiz',
      'Are you sure you want to submit this quiz? You cannot change your answers after submission.',
      'Submit',
      'Cancel'
    );

    if (!confirmed.isConfirmed) return;

    await submitQuiz();
  };

  const handleAutoSubmit = async () => {
    if (!quiz) return;

    await showSuccessAlert('Time Up!', 'Your quiz has been automatically submitted.');
    await submitQuiz();
  };

  const submitQuiz = async () => {
    if (!quiz) return;

    try {
      setSubmitting(true);
      
      // Validate that all questions have answers
      if (answers.length === 0) {
        throw new Error('No answers provided');
      }
      
      console.log('Submitting quiz with answers:', answers);
      
      const response = await quizAttemptsAPI.create({
        quizId: quiz.id,
        answers: answers
      });

      console.log('Quiz submission response:', response);
      console.log('Response data structure:', response.data);
      
      const attemptData = (response.data as any).data || response.data;
      console.log('Attempt data:', attemptData);
      
      if (!attemptData || !attemptData.id) {
        console.error('Missing attempt data:', attemptData);
        throw new Error('Invalid response from server: missing attempt data');
      }
      
      console.log('Quiz submitted successfully, navigating to result page...');
      console.log('Attempt ID:', attemptData.id);
      console.log('Navigation path:', `/student/quiz-attempts/${attemptData.id}/result`);
      
      await showSuccessAlert(
        'Quiz Submitted!',
        `Your quiz has been submitted successfully. Score: ${attemptData.score}/${attemptData.totalMarks}`
      );

      // Navigate to quiz attempt result page
      console.log('Attempting navigation to result page...');
      
      // Use setTimeout to ensure the alert is closed before navigation
      setTimeout(() => {
        try {
          console.log('Navigating to:', `/student/quiz-attempts/${attemptData.id}/result`);
          navigate(`/student/quiz-attempts/${attemptData.id}/result`);
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback navigation
          navigate('/student/quizzes');
        }
      }, 100);

      // Alternative navigation after a longer delay as backup
      setTimeout(() => {
        console.log('Backup navigation check...');
        // Check if we're still on the quiz taking page
        if (window.location.pathname.includes('/take')) {
          console.log('Still on quiz page, forcing navigation...');
          navigate('/student/quizzes');
        }
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      
      // Check if it's the "already submitted" error
      if (error.response?.data?.message?.includes('already submitted')) {
        await handleApiError(error, 'You have already submitted this quiz. You cannot submit it again.');
        // Navigate back to quizzes page
        navigate('/student/quizzes');
      } else {
        handleApiError(error, 'Failed to submit quiz');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!quiz?.questions) return 0;
    return Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100);
  };

  const getAnsweredCount = () => {
    return answers.length;
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

  // Check if questions are loaded
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading quiz questions...</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const totalQuestions = quiz.questions?.length || 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/student/quizzes')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Quizzes</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-red-600">
                <Timer className="w-5 h-5" />
                <span className="font-mono text-lg font-semibold">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <div className="flex items-center justify-between mt-2">
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Progress: {getProgressPercentage()}%</span>
                <span>Answered: {getAnsweredCount()}/{totalQuestions}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Question Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {quiz.questions?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : getCurrentAnswer(quiz.questions![index].id)
                    ? 'border-green-500 bg-green-100 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Question {currentQuestionIndex + 1}
              </h3>
              <p className="text-gray-700 leading-relaxed">{currentQuestion.question}</p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={getCurrentAnswer(currentQuestion.id) === option}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))
              )}

              {currentQuestion.type === 'TRUE_FALSE' && (
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value="true"
                      checked={getCurrentAnswer(currentQuestion.id) === 'true'}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">True</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value="false"
                      checked={getCurrentAnswer(currentQuestion.id) === 'false'}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">False</span>
                  </label>
                </div>
              )}

              {(currentQuestion.type === 'SHORT_ANSWER' || currentQuestion.type === 'ESSAY') && (
                <textarea
                  value={getCurrentAnswer(currentQuestion.id)}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Enter your answer here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={currentQuestion.type === 'ESSAY' ? 6 : 3}
                />
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Marks: {currentQuestion.marks}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center space-x-4">
            {currentQuestionIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit Quiz</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Important:</span>
          </div>
          <ul className="mt-2 text-sm text-yellow-700 space-y-1">
            <li>• Make sure to answer all questions before submitting</li>
            <li>• You cannot change your answers after submission</li>
            <li>• The quiz will be automatically submitted when time runs out</li>
            <li>• Do not refresh the page or navigate away during the quiz</li>
          </ul>
        </div>

        {/* Debug Navigation Test */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-blue-800 font-medium">Debug:</span>
          </div>
          <div className="mt-2 space-x-2">
            <button
              onClick={() => navigate('/student/quizzes')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Test: Go to Quizzes
            </button>
            <button
              onClick={() => navigate('/student/quiz-attempts/test-id/result')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Test: Go to Result Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTakingPage; 