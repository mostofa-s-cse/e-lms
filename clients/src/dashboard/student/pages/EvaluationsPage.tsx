import React, { useState, useEffect } from 'react';
import { evaluationsAPI } from '../../../services/api';
import DataTable from '../../../components/DataTable';
import { handleApiError } from '../../../utils/sweetAlert';

interface Evaluation {
  id: string;
  title: string;
  description: string;
  score?: number;
  maxScore?: number;
  feedback?: string;
  courseId: string;
  studentId: string;
  course?: {
    id: string;
    title: string;
    code: string;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface EvaluationsResponse {
  data: Evaluation[];
}

const EvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await evaluationsAPI.getAll();
      setEvaluations((response.data as EvaluationsResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch evaluations');
    } finally {
      setLoading(false);
    }
  };

  const getScorePercentage = (score?: number, maxScore?: number) => {
    if (!score || !maxScore) return null;
    return Math.round((score / maxScore) * 100);
  };

  const columns = [
    {
      key: 'title',
      label: 'Evaluation',
      render: (title: string, evaluation: Evaluation) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{evaluation.description}</div>
        </div>
      )
    },
    {
      key: 'course',
      label: 'Course',
      render: (_: any, evaluation: Evaluation) => (
        <div className="text-sm text-gray-900">
          {evaluation.course ? `${evaluation.course.code} - ${evaluation.course.title}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'score',
      label: 'Score',
      render: (_: any, evaluation: Evaluation) => {
        const percentage = getScorePercentage(evaluation.score, evaluation.maxScore);
        return (
          <div className="text-sm text-gray-900">
            {evaluation.score !== undefined && evaluation.maxScore !== undefined ? (
              <div>
                <span className="font-medium">{evaluation.score}/{evaluation.maxScore}</span>
                {percentage !== null && (
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    percentage >= 70 ? 'bg-green-100 text-green-800' :
                    percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {percentage}%
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-500">Not graded</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (_: any, evaluation: Evaluation) => (
        <div className="text-sm text-gray-900">
          {evaluation.teacher ? `${evaluation.teacher.firstName} ${evaluation.teacher.lastName}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'feedback',
      label: 'Feedback',
      render: (feedback: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {feedback || 'No feedback provided'}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Evaluations</h1>
        <p className="text-gray-600 mt-2">View your course evaluations and feedback</p>
      </div>

      <DataTable
        columns={columns}
        data={evaluations}
        loading={loading}
      />
    </div>
  );
};

export default EvaluationsPage; 