import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationsAPI } from '../../../../services/api';
import { handleApiError } from '../../../../utils/sweetAlert';
import { ArrowLeft, User, BookOpen, Target, Award, MessageSquare } from 'lucide-react';

interface Evaluation {
  id: string;
  title: string;
  description?: string;
  type: 'ASSIGNMENT' | 'EXAM' | 'PROJECT' | 'PRESENTATION' | 'QUIZ';
  score?: number;
  maxScore: number;
  feedback?: string;
  evaluatedAt: string;
  studentId: string;
  courseId: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
    code: string;
  };
  evaluator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

const EvaluationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEvaluationDetails();
    }
  }, [id]);

  const fetchEvaluationDetails = async () => {
    try {
      setLoading(true);
      const response = await evaluationsAPI.getById(id!);
      console.log('Evaluation API response:', response);
      
      if (response.data && (response.data as any).success) {
        setEvaluation((response.data as any).data as Evaluation);
      } else {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error fetching evaluation details:', error);
      handleApiError(error, 'Failed to fetch evaluation details');
      navigate('/teacher/evaluations');
    } finally {
      setLoading(false);
    }
  };

  const getEvaluationTypeColor = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT':
        return 'bg-blue-100 text-blue-800';
      case 'EXAM':
        return 'bg-red-100 text-red-800';
      case 'PROJECT':
        return 'bg-green-100 text-green-800';
      case 'PRESENTATION':
        return 'bg-purple-100 text-purple-800';
      case 'QUIZ':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScorePercentage = () => {
    if (!evaluation || !evaluation.score) return null;
    return Math.round((evaluation.score / evaluation.maxScore) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Evaluation not found</p>
      </div>
    );
  }

  const scorePercentage = getScorePercentage();
  const scoreGrade = scorePercentage ? getScoreGrade(scorePercentage) : null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/teacher/evaluations')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Evaluations</span>
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900">{evaluation.title}</h1>
          <p className="text-gray-600">ID: {evaluation.id}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evaluation Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {evaluation.description || 'No description provided'}
            </p>
          </div>

          {/* Score Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Score Information
            </h2>
            {evaluation.score !== undefined ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="text-lg font-semibold text-gray-900">{evaluation.score}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 text-green-600 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-lg font-bold">/</span>
                  </div>
                  <p className="text-sm text-gray-600">Max Score</p>
                  <p className="text-lg font-semibold text-gray-900">{evaluation.maxScore}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="w-8 h-8 text-yellow-600 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-lg font-bold">%</span>
                  </div>
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p className={`text-lg font-semibold ${scorePercentage ? getScoreColor(scorePercentage) : 'text-gray-900'}`}>
                    {scorePercentage ? `${scorePercentage}%` : 'N/A'}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 text-purple-600 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-lg font-bold">G</span>
                  </div>
                  <p className="text-sm text-gray-600">Grade</p>
                  <p className={`text-lg font-semibold ${scoreGrade ? getScoreColor(scorePercentage!) : 'text-gray-900'}`}>
                    {scoreGrade || 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Not graded yet</p>
              </div>
            )}
          </div>

          {/* Feedback */}
          {evaluation.feedback && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Feedback
              </h2>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 whitespace-pre-wrap">{evaluation.feedback}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Evaluation Type */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Evaluation Type</h2>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getEvaluationTypeColor(evaluation.type)}`}>
              {evaluation.type}
            </span>
          </div>

          {/* Student Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Student Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Student</label>
                <p className="text-gray-900 font-medium">
                  {evaluation.student ? `${evaluation.student.firstName} ${evaluation.student.lastName}` : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{evaluation.student?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Student ID</label>
                <p className="text-gray-900 font-mono text-sm">{evaluation.studentId}</p>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Course Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Course</label>
                <p className="text-gray-900 font-medium">
                  {evaluation.course ? `${evaluation.course.code} - ${evaluation.course.title}` : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Course ID</label>
                <p className="text-gray-900 font-mono text-sm">{evaluation.courseId}</p>
              </div>
            </div>
          </div>

          {/* Evaluator Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Evaluator</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Evaluated By</label>
                <p className="text-gray-900">
                  {evaluation.evaluator ? `${evaluation.evaluator.firstName} ${evaluation.evaluator.lastName}` : 'N/A'}
                </p>
              </div>
              {evaluation.evaluatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Evaluated At</label>
                  <p className="text-gray-900">{new Date(evaluation.evaluatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Timestamps</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{new Date(evaluation.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{new Date(evaluation.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationDetailsPage; 