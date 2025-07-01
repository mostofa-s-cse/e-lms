import React, { useState, useEffect } from 'react';
import { quizzesAPI } from '../../../services/api';
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

interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  course?: {
    title: string;
  };
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
}

interface QuizzesResponse {
  data: Quiz[];
}

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    timeLimit: 30,
    passingScore: 70,
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const handleCreate = () => {
    setEditingQuiz(null);
    setFormData({
      title: '',
      description: '',
      courseId: '',
      timeLimit: 30,
      passingScore: 70,
      isActive: true
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      courseId: quiz.courseId,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      isActive: quiz.isActive
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (quiz: Quiz) => {
    const result = await showDeleteConfirmDialog(`"${quiz.title}"`);
    if (result.isConfirmed) {
      try {
        await quizzesAPI.delete(quiz.id);
        showSuccessAlert('Quiz Deleted', `"${quiz.title}" has been successfully deleted.`);
        fetchQuizzes();
      } catch (error) {
        handleApiError(error, 'Failed to delete quiz');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.courseId) errors.courseId = 'Course is required';
    if (formData.timeLimit < 1) errors.timeLimit = 'Time limit must be at least 1 minute';
    if (formData.passingScore < 1 || formData.passingScore > 100) {
      errors.passingScore = 'Passing score must be between 1 and 100';
    }
    if (Object.keys(errors).length > 0) {
      showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }
    try {
      if (editingQuiz) {
        await quizzesAPI.update(editingQuiz.id, formData);
        showSuccessAlert('Quiz Updated', `"${formData.title}" has been successfully updated.`);
      } else {
        await quizzesAPI.create(formData);
        showSuccessAlert('Quiz Created', `"${formData.title}" has been successfully created.`);
      }
      setShowModal(false);
      fetchQuizzes();
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
        handleApiError(error, 'Failed to save quiz');
      }
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Quiz',
      render: (title: string, quiz: Quiz) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{quiz.course?.title}</div>
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
      key: 'timeLimit',
      label: 'Time Limit',
      render: (timeLimit: number) => (
        <span className="text-sm text-gray-900">
          {timeLimit} minutes
        </span>
      )
    },
    {
      key: 'passingScore',
      label: 'Passing Score',
      render: (passingScore: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {passingScore}%
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
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Quizzes</h1>
          <p className="text-gray-600 mt-2">Manage course quizzes and assessments</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Quiz
        </button>
      </div>

      <DataTable
        columns={columns}
        data={quizzes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingQuiz ? 'Edit Quiz' : 'Create Quiz'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          {formErrors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors.general}
            </div>
          )}

          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value as string })}
            error={formErrors.title}
            required
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value as string })}
            error={formErrors.description}
            required
            rows={3}
          />

          <FormField
            label="Course"
            name="courseId"
            type="select"
            value={formData.courseId}
            onChange={(value) => setFormData({ ...formData, courseId: value as string })}
            error={formErrors.courseId}
            required
            options={[
              { value: '', label: 'Select a course' },
              { value: '1', label: 'Course 1' },
              { value: '2', label: 'Course 2' }
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Time Limit (minutes)"
              name="timeLimit"
              type="number"
              value={formData.timeLimit}
              onChange={(value) => setFormData({ ...formData, timeLimit: value as number })}
              error={formErrors.timeLimit}
              required
            />

            <FormField
              label="Passing Score (%)"
              name="passingScore"
              type="number"
              value={formData.passingScore}
              onChange={(value) => setFormData({ ...formData, passingScore: value as number })}
              error={formErrors.passingScore}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingQuiz ? 'Update' : 'Create'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default QuizzesPage; 