import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesAPI, questionsAPI, quizAttemptsAPI } from '../../../../services/api';
import { handleApiError } from '../../../../utils/sweetAlert';
import { ArrowLeft, Clock, BookOpen, Target, Calendar, Users, Award } from 'lucide-react';
import Modal from '../../../../components/Modal';
import { DataTable } from '../../../../components';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
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

interface Question {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  options?: string[];
  correctAnswer: string;
  marks: number;
  isActive: boolean;
  quizId: string;
  quiz?: {
    id: string;
    title: string;
  };
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface QuizAnswer {
  id: string;
  answer: string;
  isCorrect: boolean;
  marksEarned: number;
  question: {
    id: string;
    question: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
    options?: string[];
    correctAnswer: string;
    marks: number;
  };
}

interface QuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
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
  answers?: QuizAnswer[];
}

const QuizDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuizDetails();
    }
  }, [id]);

  useEffect(() => {
    if (quiz && quiz.id) {
      fetchQuizQuestions(quiz.id);
      fetchQuizAttempts(quiz.id);
    }
    // eslint-disable-next-line
  }, [quiz]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await quizzesAPI.getById(id!);
      console.log('Quiz API response:', response);
      
      if (response.data && (response.data as any).success) {
        setQuiz((response.data as any).data as Quiz);
      } else {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      handleApiError(error, 'Failed to fetch quiz details');
      navigate('/admin/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizQuestions = async (quizId: string) => {
    try {
      setQuestionsLoading(true);
      const response = await questionsAPI.getByQuiz(quizId);
      if (response.data && (response.data as any).success) {
        setQuestions((response.data as any).data as Question[]);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchQuizAttempts = async (quizId: string) => {
    try {
      setAttemptsLoading(true);
      const response = await quizAttemptsAPI.getByQuiz(quizId);
      if (response.data && (response.data as any).success) {
        setAttempts((response.data as any).data as QuizAttempt[]);
      } else {
        setAttempts([]);
      }
    } catch (error) {
      setAttempts([]);
    } finally {
      setAttemptsLoading(false);
    }
  };

  const handleViewAttempt = async (attempt: QuizAttempt) => {
    try {
      const response = await quizAttemptsAPI.getById(attempt.id);
      if (response.data && (response.data as any).success) {
        setSelectedAttempt((response.data as any).data as QuizAttempt);
        setShowAttemptModal(true);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch attempt details');
    }
  };

  const getPassingPercentage = () => {
    if (!quiz) return 0;
    return Math.round((quiz.passingMarks / quiz.totalMarks) * 100);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
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

  if (!quiz) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/quizzes')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Quizzes</span>
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-600">ID: {quiz.id}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {quiz.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {quiz.description || 'No description provided'}
            </p>
          </div>

          {/* Quiz Statistics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold text-gray-900">{formatDuration(quiz.duration)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Total Marks</p>
                <p className="text-lg font-semibold text-gray-900">{quiz.totalMarks}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Target className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Passing Marks</p>
                <p className="text-lg font-semibold text-gray-900">{quiz.passingMarks}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 text-purple-600 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-lg font-bold">%</span>
                </div>
                <p className="text-sm text-gray-600">Pass Rate</p>
                <p className="text-lg font-semibold text-gray-900">{getPassingPercentage()}%</p>
              </div>
            </div>
          </div>

          {/* Time Schedule */}
          {(quiz.startTime || quiz.endTime) && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Time Schedule
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quiz.startTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Start Time</label>
                    <p className="text-gray-900 font-medium">
                      {new Date(quiz.startTime).toLocaleString()}
                    </p>
                  </div>
                )}
                {quiz.endTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">End Time</label>
                    <p className="text-gray-900 font-medium">
                      {new Date(quiz.endTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions in this Quiz</h2>
            {questionsLoading ? (
              <div className="text-gray-500">Loading questions...</div>
            ) : questions.length === 0 ? (
              <div className="text-gray-500">No questions found for this quiz.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {questions.map((q, idx) => (
                  <li key={q.id} className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Q{idx + 1}: {q.question}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="inline-block mr-2 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                            {q.type.replace('_', ' ')}
                          </span>
                          <span className="inline-block mr-2 px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-semibold">
                            {q.marks} marks
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">
                            Correct: {q.correctAnswer}
                          </span>
                        </div>
                        {q.type === 'MULTIPLE_CHOICE' && q.options && (
                          <ul className="mt-2 ml-4 list-disc text-sm text-gray-700">
                            {q.options.map((opt, i) => (
                              <li key={i} className={opt === q.correctAnswer ? 'font-semibold text-green-700' : ''}>
                                {String.fromCharCode(65 + i)}. {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 text-right">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Course</label>
                <p className="text-gray-900 font-medium">
                  {quiz.course ? `${quiz.course.code} - ${quiz.course.title}` : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Course ID</label>
                <p className="text-gray-900 font-mono text-sm">{quiz.courseId}</p>
              </div>
            </div>
          </div>

          {/* Author Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Author</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Created By</label>
                <p className="text-gray-900">
                  {quiz.author ? `${quiz.author.firstName} ${quiz.author.lastName}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Timestamps</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{new Date(quiz.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{new Date(quiz.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/admin/quizzes/${quiz.id}/edit`)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Edit Quiz
              </button>
              <button
                onClick={() => navigate(`/admin/courses/${quiz.courseId}`)}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                View Course
              </button>
            </div>
          </div>
        </div>
        
      </div>
      {/* Student Results */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Student Results ({attempts.length} attempts)
        </h2>
        <DataTable
          columns={[
            {
              key: 'student',
              label: 'Student',
              render: (value, row) => (
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {row.student ? `${row.student.firstName} ${row.student.lastName}` : 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {row.student?.email || 'No email'}
                  </div>
                </div>
              )
            },
            {
              key: 'score',
              label: 'Score',
              render: (value, row) => (
                <div className="text-sm text-gray-900">
                  {row.score}/{row.totalMarks}
                </div>
              )
            },
            {
              key: 'percentage',
              label: 'Percentage',
              render: (value, row) => {
                const percentage = getScorePercentage(row.score, row.totalMarks);
                return (
                  <span className={`text-sm font-semibold ${getScoreColor(percentage)}`}>
                    {percentage}%
                  </span>
                );
              }
            },
            {
              key: 'status',
              label: 'Status',
              render: (value, row) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  row.isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {row.isPassed ? 'Passed' : 'Failed'}
                </span>
              )
            },
            {
              key: 'completedAt',
              label: 'Completed',
              render: (value, row) => (
                <div className="text-sm text-gray-500">
                  {new Date(row.completedAt).toLocaleDateString()}
                </div>
              )
            }
          ]}
          data={attempts}
          title="Student Results"
          subtitle="View student results for this quiz"
          onView={handleViewAttempt}
          loading={attemptsLoading}
        />
      </div>

      {/* Quiz Attempt Detail Modal */}
      <Modal
        isOpen={showAttemptModal}
        onClose={() => setShowAttemptModal(false)}
        title={`Quiz Result - ${selectedAttempt?.student ? `${selectedAttempt.student.firstName} ${selectedAttempt.student.lastName}` : 'Student'}`}
        size="xl"
      >
        {selectedAttempt && (
          <div className="space-y-6">
            {/* Student Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900 font-medium">
                    {selectedAttempt.student ? `${selectedAttempt.student.firstName} ${selectedAttempt.student.lastName}` : 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedAttempt.student?.email || 'No email'}</p>
                </div>
              </div>
            </div>

            {/* Quiz Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quiz Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Quiz Title</label>
                  <p className="text-gray-900 font-medium">{selectedAttempt.quiz?.title || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-gray-900">{selectedAttempt.quiz?.duration || 0} minutes</p>
                </div>
              </div>
            </div>

            {/* Result Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Result Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedAttempt.score}</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedAttempt.totalMarks}</div>
                  <div className="text-sm text-gray-600">Total Marks</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(getScorePercentage(selectedAttempt.score, selectedAttempt.totalMarks))}`}>
                    {getScorePercentage(selectedAttempt.score, selectedAttempt.totalMarks)}%
                  </div>
                  <div className="text-sm text-gray-600">Percentage</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className={`text-2xl font-bold ${selectedAttempt.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedAttempt.isPassed ? 'PASS' : 'FAIL'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </div>

            {/* Timing Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Timing Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Started At</label>
                  <p className="text-gray-900">{new Date(selectedAttempt.startedAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Completed At</label>
                  <p className="text-gray-900">{new Date(selectedAttempt.completedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Pass/Fail Criteria */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pass/Fail Criteria</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Passing Marks</label>
                  <p className="text-gray-900">{selectedAttempt.quiz?.passingMarks || 0} marks</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Passing Percentage</label>
                  <p className="text-gray-900">
                    {selectedAttempt.quiz?.passingMarks && selectedAttempt.quiz?.totalMarks 
                      ? Math.round((selectedAttempt.quiz.passingMarks / selectedAttempt.quiz.totalMarks) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Question-by-Question Breakdown */}
            {selectedAttempt.answers && selectedAttempt.answers.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Question-by-Question Breakdown</h3>
                <div className="space-y-4">
                  {selectedAttempt.answers.map((answer, index) => (
                    <div key={answer.id} className="bg-white p-4 rounded-lg border">
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
                        <p className="text-gray-900 mb-2">{answer.question.question}</p>
                        <div className="text-sm text-gray-500">
                          <span className="inline-block mr-2 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                            {answer.question.type.replace('_', ' ')}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs font-semibold">
                            {answer.question.marks} marks
                          </span>
                        </div>
                      </div>

                      {/* Show options for multiple choice questions */}
                      {answer.question.type === 'MULTIPLE_CHOICE' && answer.question.options && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                          <ul className="space-y-1">
                            {answer.question.options.map((option, i) => (
                              <li key={i} className={`text-sm ${
                                option === answer.question.correctAnswer 
                                  ? 'text-green-700 font-semibold' 
                                  : option === answer.answer && !answer.isCorrect
                                  ? 'text-red-700 font-semibold'
                                  : 'text-gray-600'
                              }`}>
                                {String.fromCharCode(65 + i)}. {option}
                                {option === answer.question.correctAnswer && ' ✓'}
                                {option === answer.answer && !answer.isCorrect && ' ✗'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Student's Answer</label>
                          <p className={`text-sm font-medium ${
                            answer.isCorrect ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {answer.answer}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Correct Answer</label>
                          <p className="text-sm font-medium text-green-700">
                            {answer.question.correctAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuizDetailsPage; 