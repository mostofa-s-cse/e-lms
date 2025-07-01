import React, { useState, useEffect } from 'react';
import { questionsAPI } from '../../../services/api';
import DataTable from '../../../pages/DataTable';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirmDialog,
  showFormErrorAlert,
  handleApiError
} from '../../../utils/sweetAlert';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correctAnswer: string;
  points: number;
  quizId: string;
  quiz?: {
    title: string;
  };
  createdAt: string;
}

interface QuestionsResponse {
  data: Question[];
}

const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    type: 'multiple_choice' as 'multiple_choice' | 'true_false' | 'short_answer',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    quizId: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchQuestions();
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

  const handleCreate = () => {
    setEditingQuestion(null);
    setFormData({
      text: '',
      type: 'multiple_choice',
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
      text: question.text,
      type: question.type,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      points: question.points,
      quizId: question.quizId
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (question: Question) => {
    const result = await showDeleteConfirmDialog('this question');
    if (result.isConfirmed) {
      try {
        await questionsAPI.delete(question.id);
        showSuccessAlert('Question Deleted', 'The question has been successfully deleted.');
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

  const handleTypeChange = (type: string) => {
    setFormData({
      ...formData,
      type: type as 'multiple_choice' | 'true_false' | 'short_answer',
      options: type === 'multiple_choice' ? ['', '', '', ''] : ['', ''],
      correctAnswer: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!formData.text.trim()) errors.text = 'Question text is required';
    if (!formData.quizId) errors.quizId = 'Quiz is required';
    if (formData.points < 1) errors.points = 'Points must be at least 1';
    if (!formData.correctAnswer.trim()) errors.correctAnswer = 'Correct answer is required';
    if (formData.type === 'multiple_choice') {
      const validOptions = formData.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        errors.options = 'At least 2 options are required';
      }
      if (!formData.options.includes(formData.correctAnswer)) {
        errors.correctAnswer = 'Correct answer must be one of the options';
      }
    }
    if (Object.keys(errors).length > 0) {
      showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }
    try {
      const submitData = {
        ...formData,
        options: formData.options.filter(opt => opt.trim() !== '')
      };
      if (editingQuestion) {
        await questionsAPI.update(editingQuestion.id, submitData);
        showSuccessAlert('Question Updated', 'The question has been successfully updated.');
      } else {
        await questionsAPI.create(submitData);
        showSuccessAlert('Question Created', 'The question has been successfully created.');
      }
      setShowModal(false);
      fetchQuestions();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) {
            serverErrors[err.field] = err.message;
          }
        });
        showFormErrorAlert(serverErrors);
        setFormErrors(serverErrors);
      } else {
        handleApiError(error, 'Failed to save question');
      }
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'Multiple Choice';
      case 'true_false': return 'True/False';
      case 'short_answer': return 'Short Answer';
      default: return type;
    }
  };

  const columns = [
    {
      key: 'text',
      label: 'Question',
      render: (text: string, question: Question) => (
        <div>
          <div className="text-sm font-medium text-gray-900 max-w-md truncate">{text}</div>
          <div className="text-sm text-gray-500">{question.quiz?.title}</div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (type: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {getQuestionTypeLabel(type)}
        </span>
      )
    },
    {
      key: 'points',
      label: 'Points',
      render: (points: number) => (
        <span className="text-sm text-gray-900">
          {points} point{points !== 1 ? 's' : ''}
        </span>
      )
    },
    {
      key: 'correctAnswer',
      label: 'Correct Answer',
      render: (correctAnswer: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {correctAnswer}
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
        <div>
          <h1 className="text-3xl font-bold">My Questions</h1>
          <p className="text-gray-600 mt-2">Manage quiz questions and answers</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Question
        </button>
      </div>

      <DataTable
        columns={columns}
        data={questions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingQuestion ? 'Edit Question' : 'Create Question'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          {formErrors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors.general}
            </div>
          )}

          <FormField
            label="Question Text"
            name="text"
            type="textarea"
            value={formData.text}
            onChange={(value) => setFormData({ ...formData, text: value as string })}
            error={formErrors.text}
            required
            rows={3}
          />

          <FormField
            label="Quiz"
            name="quizId"
            type="select"
            value={formData.quizId}
            onChange={(value) => setFormData({ ...formData, quizId: value as string })}
            error={formErrors.quizId}
            required
            options={[
              { value: '', label: 'Select a quiz' },
              { value: '1', label: 'Quiz 1' },
              { value: '2', label: 'Quiz 2' }
            ]}
          />

          <FormField
            label="Question Type"
            name="type"
            type="select"
            value={formData.type}
            onChange={(value) => handleTypeChange(value as string)}
            options={[
              { value: 'multiple_choice', label: 'Multiple Choice' },
              { value: 'true_false', label: 'True/False' },
              { value: 'short_answer', label: 'Short Answer' }
            ]}
          />

          <FormField
            label="Points"
            name="points"
            type="number"
            value={formData.points}
            onChange={(value) => setFormData({ ...formData, points: value as number })}
            error={formErrors.points}
            required
          />

          {formData.type === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options *
              </label>
              {formData.options.map((option, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              {formErrors.options && (
                <p className="mt-1 text-sm text-red-600">{formErrors.options}</p>
              )}
            </div>
          )}

          {formData.type === 'true_false' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer *
              </label>
              <select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select answer</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
              {formErrors.correctAnswer && (
                <p className="mt-1 text-sm text-red-600">{formErrors.correctAnswer}</p>
              )}
            </div>
          )}

          {(formData.type === 'multiple_choice' || formData.type === 'short_answer') && (
            <FormField
              label="Correct Answer"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={(value) => setFormData({ ...formData, correctAnswer: value as string })}
              error={formErrors.correctAnswer}
              required
            />
          )}

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