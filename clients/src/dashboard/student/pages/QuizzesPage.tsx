import React, { useState, useEffect } from 'react';
import { quizzesAPI } from '../../../services/api';
import DataTable from '../../../pages/DataTable';
import { handleApiError, showInfoAlert } from '../../../utils/sweetAlert';

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  maxAttempts: number;
  isActive: boolean;
  courseId: string;
  course?: {
    id: string;
    title: string;
    code: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface QuizzesResponse {
  data: Quiz[];
}

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizzesAPI.getAll();
      setQuizzes((response.data as QuizzesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = async (quiz: Quiz) => {
    // This would typically navigate to a quiz taking interface
    await showInfoAlert('Quiz Starting', `Starting quiz: ${quiz.title}`);
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
      key: 'passingScore',
      label: 'Passing Score',
      render: (passingScore: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {passingScore}%
        </span>
      )
    },
    {
      key: 'maxAttempts',
      label: 'Max Attempts',
      render: (maxAttempts: number) => (
        <span className="text-sm text-gray-900">{maxAttempts}</span>
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
      render: (_: any, quiz: Quiz) => (
        <div className="text-sm font-medium">
          {quiz.isActive && (
            <button
              onClick={() => handleTakeQuiz(quiz)}
              className="text-blue-600 hover:text-blue-900"
            >
              Take Quiz
            </button>
          )}
        </div>
      )
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
        title="Quizzes"
        subtitle="Take quizzes for your enrolled courses"
        loading={loading}
      />
    </div>
  );
};

export default QuizzesPage; 