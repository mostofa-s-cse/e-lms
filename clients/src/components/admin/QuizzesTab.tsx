import React from 'react';
import DataTable from '../DataTable';
import { Quiz } from './types';

interface QuizzesTabProps {
  quizzes: Quiz[];
  loading: boolean;
  onEdit: (quiz: Quiz) => void;
  onDelete: (quiz: Quiz) => void;
  onCreate: () => void;
}

const QuizzesTab: React.FC<QuizzesTabProps> = ({ 
  quizzes, 
  loading, 
  onEdit, 
  onDelete, 
  onCreate 
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <button
          onClick={onCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Quiz
        </button>
      </div>
      <DataTable
        columns={[
          {
            key: 'title',
            label: 'Title',
            render: (title: string, quiz: Quiz) => (
              <div>
                <div className="text-sm font-medium text-gray-900">{title}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {quiz.description.length > 100 ? `${quiz.description.substring(0, 100)}...` : quiz.description}
                </div>
              </div>
            )
          },
          {
            key: 'duration',
            label: 'Duration',
            render: (duration: number) => (
              <span className="text-sm text-gray-900">
                {formatDuration(duration)}
              </span>
            )
          },
          {
            key: 'passingScore',
            label: 'Passing Score',
            render: (passingScore: number) => (
              <span className="text-sm text-gray-900">
                {passingScore}%
              </span>
            )
          },
          {
            key: 'isActive',
            label: 'Status',
            render: (isActive: boolean) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            )
          },
          {
            key: 'createdAt',
            label: 'Created',
            render: (date: string) => (
              <span className="text-sm text-gray-900">
                {new Date(date).toLocaleDateString()}
              </span>
            )
          }
        ]}
        data={quizzes}
        loading={loading}
        title="Course Quizzes"
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default QuizzesTab; 