import React, { useState, useEffect } from 'react';
import { evaluationsAPI } from '../../../services/api';
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

interface Evaluation {
  id: string;
  title: string;
  description: string;
  courseId: string;
  course?: {
    title: string;
  };
  studentId: string;
  student?: {
    firstName: string;
    lastName: string;
  };
  score: number;
  maxScore: number;
  feedback: string;
  evaluationDate: string;
  createdAt: string;
}

interface EvaluationsResponse {
  data: Evaluation[];
}

const EvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    studentId: '',
    score: 0,
    maxScore: 100,
    feedback: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const handleCreate = () => {
    setEditingEvaluation(null);
    setFormData({
      title: '',
      description: '',
      courseId: '',
      studentId: '',
      score: 0,
      maxScore: 100,
      feedback: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    setFormData({
      title: evaluation.title,
      description: evaluation.description,
      courseId: evaluation.courseId,
      studentId: evaluation.studentId,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      feedback: evaluation.feedback
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (evaluation: Evaluation) => {
    const result = await showDeleteConfirmDialog(`"${evaluation.title}"`);
    if (result.isConfirmed) {
      try {
        await evaluationsAPI.delete(evaluation.id);
        showSuccessAlert('Evaluation Deleted', `"${evaluation.title}" has been successfully deleted.`);
        fetchEvaluations();
      } catch (error) {
        handleApiError(error, 'Failed to delete evaluation');
      }
    }
  };

  const calculatePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = calculatePercentage(score, maxScore);
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.courseId) errors.courseId = 'Course is required';
    if (!formData.studentId) errors.studentId = 'Student is required';
    if (formData.score < 0) errors.score = 'Score cannot be negative';
    if (formData.maxScore < 1) errors.maxScore = 'Maximum score must be at least 1';
    if (formData.score > formData.maxScore) {
      errors.score = 'Score cannot exceed maximum score';
    }
    if (Object.keys(errors).length > 0) {
      showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }
    try {
      const submitData = {
        ...formData,
        evaluationDate: new Date().toISOString()
      };
      if (editingEvaluation) {
        await evaluationsAPI.update(editingEvaluation.id, submitData);
        showSuccessAlert('Evaluation Updated', `"${formData.title}" has been successfully updated.`);
      } else {
        await evaluationsAPI.create(submitData);
        showSuccessAlert('Evaluation Created', `"${formData.title}" has been successfully created.`);
      }
      setShowModal(false);
      fetchEvaluations();
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
        handleApiError(error, 'Failed to save evaluation');
      }
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Evaluation',
      render: (title: string, evaluation: Evaluation) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{evaluation.course?.title}</div>
        </div>
      )
    },
    {
      key: 'student',
      label: 'Student',
      render: (_: any, evaluation: Evaluation) => (
        <div className="text-sm text-gray-900">
          {evaluation.student ? `${evaluation.student.firstName} ${evaluation.student.lastName}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'score',
      label: 'Score',
      render: (_: any, evaluation: Evaluation) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-900">
            {evaluation.score}/{evaluation.maxScore}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(evaluation.score, evaluation.maxScore)}`}>
            {calculatePercentage(evaluation.score, evaluation.maxScore)}%
          </span>
        </div>
      )
    },
    {
      key: 'feedback',
      label: 'Feedback',
      render: (feedback: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {feedback || 'No feedback'}
        </div>
      )
    },
    {
      key: 'evaluationDate',
      label: 'Date',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Evaluations</h1>
          <p className="text-gray-600 mt-2">Manage student evaluations and assessments</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Evaluation
        </button>
      </div>

      <DataTable
        columns={columns}
        data={evaluations}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEvaluation ? 'Edit Evaluation' : 'Create Evaluation'}
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

          <div className="grid grid-cols-2 gap-4">
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

            <FormField
              label="Student"
              name="studentId"
              type="select"
              value={formData.studentId}
              onChange={(value) => setFormData({ ...formData, studentId: value as string })}
              error={formErrors.studentId}
              required
              options={[
                { value: '', label: 'Select a student' },
                { value: '1', label: 'Student 1' },
                { value: '2', label: 'Student 2' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Score"
              name="score"
              type="number"
              value={formData.score}
              onChange={(value) => setFormData({ ...formData, score: value as number })}
              error={formErrors.score}
              required
            />

            <FormField
              label="Maximum Score"
              name="maxScore"
              type="number"
              value={formData.maxScore}
              onChange={(value) => setFormData({ ...formData, maxScore: value as number })}
              error={formErrors.maxScore}
              required
            />
          </div>

          <FormField
            label="Feedback"
            name="feedback"
            type="textarea"
            value={formData.feedback}
            onChange={(value) => setFormData({ ...formData, feedback: value as string })}
            error={formErrors.feedback}
            rows={4}
          />

          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingEvaluation ? 'Update' : 'Create'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default EvaluationsPage; 