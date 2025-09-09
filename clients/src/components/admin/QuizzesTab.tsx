import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../DataTable';
import QuestionsTab from './QuestionsTab';
import { Quiz } from './types';

interface QuizzesTabProps {
  quizzes: Quiz[];
  loading: boolean;
  onEdit: (quiz: Quiz) => void;
  onDelete: (quiz: Quiz) => void;
  onCreate: () => void;
  onQuestions?: (quiz: Quiz) => void;
  quizQuestions?: Record<string, any[]>;
  onQuestionsUpdated?: (quizId: string) => void;
}

const QuizzesTab: React.FC<QuizzesTabProps> = ({ 
  quizzes, 
  loading, 
  onEdit, 
  onDelete, 
  onCreate,
  onQuestions,
  quizQuestions = {},
  onQuestionsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'questions'>('quizzes');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const navigate = useNavigate();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleQuestionsClick = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setActiveTab('questions');
    // Trigger questions fetch if not already loaded
    if (onQuestions) {
      onQuestions(quiz);
    }
  };

  const handleView = (quiz: Quiz) => {
    navigate(`/admin/quizzes/${quiz.id}`);
  };

  const handleBackToQuizzes = () => {
    setActiveTab('quizzes');
    setSelectedQuiz(null);
  };

  const handleQuestionsUpdated = () => {
    if (selectedQuiz && onQuestionsUpdated) {
      onQuestionsUpdated(selectedQuiz.id);
    }
  };

  if (activeTab === 'questions' && selectedQuiz) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={handleBackToQuizzes}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <span>←</span>
            <span>Back to Quizzes</span>
          </button>
        </div>
        <QuestionsTab
          quizId={selectedQuiz.id}
          authorId={selectedQuiz.author?.id || ''}
          quizTitle={selectedQuiz.title}
          questions={quizQuestions[selectedQuiz.id] || []}
          onQuestionsUpdated={handleQuestionsUpdated}
        />
      </div>
    );
  }

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
            key: 'totalMarks',
            label: 'Total Marks',
            render: (totalMarks: number) => (
              <span className="text-sm text-gray-900">
                {totalMarks} marks
              </span>
            )
          },
          {
            key: 'passingMarks',
            label: 'Passing Marks',
            render: (passingMarks: number, quiz: Quiz) => (
              <span className="text-sm text-gray-900">
                {passingMarks}/{quiz.totalMarks} ({Math.round((passingMarks / quiz.totalMarks) * 100)}%)
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
          },
          {
            key: 'actions',
            label: 'Add Questions',
            render: (_, quiz: Quiz) => (
              <div className="flex space-x-2">
                
                
                <button
                  onClick={() => handleQuestionsClick(quiz)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Add Questions
                </button>
                
              </div>
            )
          }
        ]}
        data={quizzes}
        loading={loading}
        title="Course Quizzes"
        onEdit={onEdit}
        onDelete={onDelete}
        onView={handleView}
      />
    </div>
  );
};

export default QuizzesTab; 