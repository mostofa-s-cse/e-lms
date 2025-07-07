import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionsAPI } from '../../../../services/api';
import { handleApiError } from '../../../../utils/sweetAlert';
import { ArrowLeft } from 'lucide-react';

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

const QuestionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchQuestionDetails();
    }
  }, [id]);

  const fetchQuestionDetails = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getById(id!);
      console.log('Question API response:', response);
      
      if (response.data && (response.data as any).success) {
        setQuestion((response.data as any).data as Question);
      } else {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching question details:', error);
      handleApiError(error, 'Failed to fetch question details');
      navigate('/admin/questions');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'bg-blue-100 text-blue-800';
      case 'TRUE_FALSE':
        return 'bg-green-100 text-green-800';
      case 'SHORT_ANSWER':
        return 'bg-yellow-100 text-yellow-800';
      case 'ESSAY':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    return type.replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Question not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/questions')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Questions</span>
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900">Question Details</h1>
          <p className="text-gray-600">ID: {question.id}</p>
        </div>
      </div>

      {/* Question Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          question.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {question.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Question</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{question.question}</p>
          </div>

          {/* Question Type and Marks */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Type</label>
                <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full mt-1 ${getQuestionTypeColor(question.type)}`}>
                  {getQuestionTypeLabel(question.type)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Marks</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{question.marks} marks</p>
              </div>
            </div>
          </div>

          {/* Options (for Multiple Choice) */}
          {question.type === 'MULTIPLE_CHOICE' && question.options && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Options</h2>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${
                      option === question.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-gray-700">{option}</span>
                      {option === question.correctAnswer && (
                        <span className="text-green-600 font-semibold">✓ Correct Answer</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer */}
          {question.type !== 'MULTIPLE_CHOICE' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Correct Answer</h2>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">{question.correctAnswer}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quiz Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Quiz</label>
                <p className="text-gray-900 font-medium">{question.quiz?.title || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Quiz ID</label>
                <p className="text-gray-900 font-mono text-sm">{question.quizId}</p>
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
                  {question.author ? `${question.author.firstName} ${question.author.lastName}` : 'N/A'}
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
                <p className="text-gray-900">{new Date(question.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{new Date(question.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailsPage; 