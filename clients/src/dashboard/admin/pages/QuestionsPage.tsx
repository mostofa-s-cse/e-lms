import React, { useState, useEffect } from 'react';
import { questionsAPI, quizzesAPI } from '../../../services/api';
import DataTable from '../../../pages/DataTable';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import { 
  showErrorAlert, 
  showSuccessAlert, 
  showDeleteConfirmDialog, 
  showFormErrorAlert,
  handleApiError 
} from '../../../utils/sweetAlert';

interface Question {
  id: string;
  title: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  options?: string[];
  correctAnswer?: string;
  points: number;
  quizId: string;
  quiz?: {
    id: string;
    title: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Quiz {
  id: string;
  title: string;
}

interface QuestionsResponse {
  data: Question[];
}

interface QuizzesResponse {
  data: Quiz[];
}

const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    quizId: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchQuestions();
    fetchQuizzes();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getAll();
      setQuestions((response.data as QuestionsResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await quizzesAPI.getAll();
      setQuizzes((response.data as QuizzesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch quizzes');
    }
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setFormData({
      title: '',
      content: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      quizId: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      content: question.content,
      type: question.type,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      points: question.points,
      quizId: question.quizId
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (question: Question) => {
    const result = await showDeleteConfirmDialog(`"${question.title}"`);
    if (result.isConfirmed) {
      try {
        await questionsAPI.delete(question.id);
        await showSuccessAlert('Success', 'Question deleted successfully');
        fetchQuestions();
      } catch (error) {
        handleApiError(error, 'Failed to delete question');
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.content.trim()) errors.content = 'Content is required';
    if (!formData.quizId) errors.quizId = 'Quiz is required';
    if (formData.points < 1) errors.points = 'Points must be at least 1';

    if (formData.type === 'MULTIPLE_CHOICE') {
      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) errors.options = 'At least 2 options are required';
      if (!formData.correctAnswer.trim()) errors.correctAnswer = 'Correct answer is required';
    }

    if (Object.keys(errors).length > 0) {
      await showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = {
        ...formData,
        options: formData.type === 'MULTIPLE_CHOICE' ? formData.options.filter(opt => opt.trim()) : undefined
      };

      if (editingQuestion) {
        await questionsAPI.update(editingQuestion.id, submitData);
        await showSuccessAlert('Success', 'Question updated successfully');
      } else {
        await questionsAPI.create(submitData);
        await showSuccessAlert('Success', 'Question created successfully');
      }
      setShowModal(false);
      fetchQuestions();
    } catch (error: any) {
      handleApiError(error, 'Failed to save question');
    }
  };

  const questionTypeOptions = [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
    { value: 'TRUE_FALSE', label: 'True/False' },
    { value: 'SHORT_ANSWER', label: 'Short Answer' },
    { value: 'ESSAY', label: 'Essay' }
  ];

  const quizOptions = quizzes.map(quiz => ({
    value: quiz.id,
    label: quiz.title
  }));

  const columns = [
    {
      key: 'title',
      label: 'Question',
      render: (title: string, question: Question) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{question.content}</div>
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
      key: 'quiz',
      label: 'Quiz',
      render: (_: any, question: Question) => (
        <div className="text-sm text-gray-900">
          {question.quiz ? question.quiz.title : 'N/A'}
        </div>
      )
    },
    {
      key: 'points',
      label: 'Points',
      render: (points: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {points} pts
        </span>
      )
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (_: any, question: Question) => (
        <div className="text-sm text-gray-900">
          {question.teacher ? `${question.teacher.firstName} ${question.teacher.lastName}` : 'N/A'}
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Questions Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Question
        </button>
      </div>

      <DataTable
        columns={columns}
        title="Questions"
        subtitle="Manage questions and their details"
        data={questions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingQuestion ? 'Edit Question' : 'Create Question'}
        size="xl"
      >
        <Form onSubmit={handleSubmit}>
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value as string })}
            error={formErrors.title}
            required
          />

          <FormField
            label="Quiz"
            name="quizId"
            type="select"
            value={formData.quizId}
            onChange={(value) => setFormData({ ...formData, quizId: value as string })}
            options={quizOptions}
            error={formErrors.quizId}
            required
          />

          <FormField
            label="Question Type"
            name="type"
            type="select"
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as any })}
            options={questionTypeOptions}
            required
          />

          <FormField
            label="Question Content"
            name="content"
            type="textarea"
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value as string })}
            error={formErrors.content}
            required
            rows={4}
          />

          {formData.type === 'MULTIPLE_CHOICE' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={option}
                    checked={formData.correctAnswer === option}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              {formErrors.options && (
                <p className="text-sm text-red-600">{formErrors.options}</p>
              )}
              {formErrors.correctAnswer && (
                <p className="text-sm text-red-600">{formErrors.correctAnswer}</p>
              )}
            </div>
          )}

          {formData.type === 'TRUE_FALSE' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Correct Answer
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="true"
                    checked={formData.correctAnswer === 'true'}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">True</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="false"
                    checked={formData.correctAnswer === 'false'}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">False</span>
                </label>
              </div>
            </div>
          )}

          <FormField
            label="Points"
            name="points"
            type="number"
            value={formData.points}
            onChange={(value) => setFormData({ ...formData, points: value as number })}
            error={formErrors.points}
            required
          />

          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingQuestion ? 'Update' : 'Create'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionsPage; 