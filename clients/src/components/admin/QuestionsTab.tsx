import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../DataTable';
import QuestionModal from './QuestionModal';
import { showDeleteConfirmDialog, showSuccessAlert, handleApiError } from '../../utils/sweetAlert';
import { questionsAPI } from '../../services/api';

interface Question {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  options?: string[];
  correctAnswer: string;
  marks: number;
  isActive: boolean;
  quizId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

interface QuestionsTabProps {
  quizId: string;
  quizTitle: string;
  questions: Question[];
  onQuestionsUpdated: () => void;
  authorId: string;
}

const QuestionsTab: React.FC<QuestionsTabProps> = ({ 
  quizId, 
  quizTitle, 
  questions, 
  onQuestionsUpdated,
  authorId
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const navigate = useNavigate();

  const handleCreate = () => {
    setEditingQuestion(null);
    setShowModal(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleView = (question: Question) => {
    navigate(`/admin/quizzes/${quizId}`);
  };

  const handleDelete = async (question: Question) => {
    const result = await showDeleteConfirmDialog(`"${question.question.substring(0, 50)}..."`);
    if (result.isConfirmed) {
      try {
        await questionsAPI.delete(question.id);
        await showSuccessAlert('Success', 'Question deleted successfully');
        onQuestionsUpdated();
      } catch (error) {
        handleApiError(error, 'Failed to delete question');
      }
    }
  };

  const handleQuestionSaved = () => {
    onQuestionsUpdated();
  };

  const columns = [
    {
      key: 'question',
      label: 'Question',
      render: (question: string, questionObj: Question) => (
        <div>
          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{question}</div>
          <div className="text-sm text-gray-500">
            {questionObj.type === 'MULTIPLE_CHOICE' && questionObj.options && (
              <span>Options: {questionObj.options.length}</span>
            )}
            {questionObj.type === 'TRUE_FALSE' && (
              <span>Answer: {questionObj.correctAnswer}</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (type: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          type === 'MULTIPLE_CHOICE' ? 'bg-blue-100 text-blue-800' :
          type === 'TRUE_FALSE' ? 'bg-green-100 text-green-800' :
          type === 'SHORT_ANSWER' ? 'bg-yellow-100 text-yellow-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {type.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'marks',
      label: 'Marks',
      render: (marks: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {marks} marks
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (isActive: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quiz Questions</h3>
          <p className="text-sm text-gray-600">Manage questions for: {quizTitle}</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Question</span>
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first question to this quiz.</p>
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add First Question
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={questions}
          loading={false}
          title={`Questions for ${quizTitle}`}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      <QuestionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        quizId={quizId}
        quizTitle={quizTitle}
        authorId={authorId}
        editingQuestion={editingQuestion}
        onQuestionSaved={handleQuestionSaved}
      />
    </div>
  );
};

export default QuestionsTab;
