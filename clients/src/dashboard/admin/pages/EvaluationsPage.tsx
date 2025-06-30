import React, { useState, useEffect } from 'react';
import { evaluationsAPI, coursesAPI, usersAPI } from '../../../services/api';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import { 
  showErrorAlert, 
  showSuccessAlert, 
  showDeleteConfirmDialog, 
  showFormErrorAlert,
  handleApiError 
} from '../../../utils/sweetAlert';

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

interface Course {
  id: string;
  title: string;
  code: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface EvaluationsResponse {
  data: Evaluation[];
}

interface CoursesResponse {
  data: Course[];
}

interface StudentsResponse {
  data: Student[];
}

const EvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    score: '',
    maxScore: '',
    feedback: '',
    courseId: '',
    studentId: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchEvaluations();
    fetchCourses();
    fetchStudents();
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

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses((response.data as CoursesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch courses');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await usersAPI.getAll();
      const allUsers = (response.data as any).data;
      const studentUsers = allUsers.filter((user: any) => user.role === 'STUDENT');
      setStudents(studentUsers);
    } catch (error) {
      handleApiError(error, 'Failed to fetch students');
    }
  };

  const handleCreate = () => {
    setEditingEvaluation(null);
    setFormData({
      title: '',
      description: '',
      score: '',
      maxScore: '',
      feedback: '',
      courseId: '',
      studentId: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    setFormData({
      title: evaluation.title,
      description: evaluation.description,
      score: evaluation.score?.toString() || '',
      maxScore: evaluation.maxScore?.toString() || '',
      feedback: evaluation.feedback || '',
      courseId: evaluation.courseId,
      studentId: evaluation.studentId
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (evaluation: Evaluation) => {
    const result = await showDeleteConfirmDialog(`"${evaluation.title}"`);
    if (result.isConfirmed) {
      try {
        await evaluationsAPI.delete(evaluation.id);
        await showSuccessAlert('Success', 'Evaluation deleted successfully');
        fetchEvaluations();
      } catch (error) {
        handleApiError(error, 'Failed to delete evaluation');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.courseId) errors.courseId = 'Course is required';
    if (!formData.studentId) errors.studentId = 'Student is required';
    
    if (formData.score && formData.maxScore) {
      const score = parseFloat(formData.score);
      const maxScore = parseFloat(formData.maxScore);
      if (score > maxScore) errors.score = 'Score cannot exceed maximum score';
      if (score < 0) errors.score = 'Score cannot be negative';
    }

    if (Object.keys(errors).length > 0) {
      await showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = {
        ...formData,
        score: formData.score ? parseFloat(formData.score) : undefined,
        maxScore: formData.maxScore ? parseFloat(formData.maxScore) : undefined
      };

      if (editingEvaluation) {
        await evaluationsAPI.update(editingEvaluation.id, submitData);
        await showSuccessAlert('Success', 'Evaluation updated successfully');
      } else {
        await evaluationsAPI.create(submitData);
        await showSuccessAlert('Success', 'Evaluation created successfully');
      }
      setShowModal(false);
      fetchEvaluations();
    } catch (error: any) {
      handleApiError(error, 'Failed to save evaluation');
    }
  };

  const courseOptions = courses.map(course => ({
    value: course.id,
    label: `${course.code} - ${course.title}`
  }));

  const studentOptions = students.map(student => ({
    value: student.id,
    label: `${student.firstName} ${student.lastName} (${student.email})`
  }));

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
      key: 'student',
      label: 'Student',
      render: (_: any, evaluation: Evaluation) => (
        <div className="text-sm text-gray-900">
          {evaluation.student ? `${evaluation.student.firstName} ${evaluation.student.lastName}` : 'N/A'}
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
      key: 'createdAt',
      label: 'Created',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Evaluations Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Evaluation
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
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value as string })}
            error={formErrors.title}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Course"
              name="courseId"
              type="select"
              value={formData.courseId}
              onChange={(value) => setFormData({ ...formData, courseId: value as string })}
              options={courseOptions}
              error={formErrors.courseId}
              required
            />

            <FormField
              label="Student"
              name="studentId"
              type="select"
              value={formData.studentId}
              onChange={(value) => setFormData({ ...formData, studentId: value as string })}
              options={studentOptions}
              error={formErrors.studentId}
              required
            />
          </div>

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value as string })}
            error={formErrors.description}
            required
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Score"
              name="score"
              type="number"
              value={formData.score}
              onChange={(value) => setFormData({ ...formData, score: value as string })}
              error={formErrors.score}
              placeholder="Optional"
            />

            <FormField
              label="Maximum Score"
              name="maxScore"
              type="number"
              value={formData.maxScore}
              onChange={(value) => setFormData({ ...formData, maxScore: value as string })}
              error={formErrors.maxScore}
              placeholder="Optional"
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
            placeholder="Optional feedback for the student"
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