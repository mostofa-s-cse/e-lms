import React, { useState, useEffect } from 'react';
import { quizzesAPI, coursesAPI } from '../../../services/api';
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

interface Quiz {
  id: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  courseId: string;
  course?: {
    id: string;
    title: string;
    code: string;
  };
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  title: string;
  code: string;
}

interface QuizzesResponse {
  data: Quiz[];
}

interface CoursesResponse {
  data: Course[];
}

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    totalMarks: 100,
    passingMarks: 70,
    isActive: true,
    courseId: '',
    startTime: '',
    endTime: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
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

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses((response.data as CoursesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch courses');
    }
  };

  const handleCreate = () => {
    setEditingQuiz(null);
    setFormData({
      title: '',
      description: '',
      duration: 30,
      totalMarks: 100,
      passingMarks: 70,
      isActive: true,
      courseId: '',
      startTime: '',
      endTime: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      duration: quiz.duration,
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
      isActive: quiz.isActive,
      courseId: quiz.courseId,
      startTime: quiz.startTime ? quiz.startTime.split('T')[0] : '',
      endTime: quiz.endTime ? quiz.endTime.split('T')[0] : ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (quiz: Quiz) => {
    const result = await showDeleteConfirmDialog(`"${quiz.title}"`);
    if (result.isConfirmed) {
      try {
        await quizzesAPI.delete(quiz.id);
        await showSuccessAlert('Success', 'Quiz deleted successfully');
        fetchQuizzes();
      } catch (error) {
        handleApiError(error, 'Failed to delete quiz');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.courseId) errors.courseId = 'Course is required';
    if (formData.duration < 1) errors.duration = 'Duration must be at least 1 minute';
    if (formData.totalMarks < 1) errors.totalMarks = 'Total marks must be at least 1';
    if (formData.passingMarks < 0 || formData.passingMarks > formData.totalMarks) {
      errors.passingMarks = 'Passing marks cannot exceed total marks';
    }

    if (Object.keys(errors).length > 0) {
      await showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }

    try {
      if (editingQuiz) {
        await quizzesAPI.update(editingQuiz.id, formData);
        await showSuccessAlert('Success', 'Quiz updated successfully');
      } else {
        await quizzesAPI.create(formData);
        await showSuccessAlert('Success', 'Quiz created successfully');
      }
      setShowModal(false);
      fetchQuizzes();
    } catch (error: any) {
      handleApiError(error, 'Failed to save quiz');
    }
  };

  const courseOptions = courses.map(course => ({
    value: course.id,
    label: `${course.code} - ${course.title}`
  }));

  const columns = [
    {
      key: 'title',
      label: 'Title',
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
      key: 'totalMarks',
      label: 'Total Marks',
      render: (totalMarks: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {totalMarks} marks
        </span>
      )
    },
    {
      key: 'passingMarks',
      label: 'Passing Marks',
      render: (passingMarks: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {passingMarks} marks
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
        <h1 className="text-3xl font-bold">Quizzes Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Quiz
        </button>
      </div>

      <DataTable
        columns={columns}
        title="Quizzes"
        subtitle="Manage quizzes and their details"
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
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value as string })}
            error={formErrors.title}
            required
          />

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
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={(value) => setFormData({ ...formData, duration: value as number })}
              error={formErrors.duration}
              required
            />

            <FormField
              label="Total Marks"
              name="totalMarks"
              type="number"
              value={formData.totalMarks}
              onChange={(value) => setFormData({ ...formData, totalMarks: value as number })}
              error={formErrors.totalMarks}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Passing Marks"
              name="passingMarks"
              type="number"
              value={formData.passingMarks}
              onChange={(value) => setFormData({ ...formData, passingMarks: value as number })}
              error={formErrors.passingMarks}
              required
            />

            <FormField
              label="Start Date"
              name="startTime"
              type="date"
              value={formData.startTime}
              onChange={(value) => setFormData({ ...formData, startTime: value as string })}
              error={formErrors.startTime}
            />
          </div>

          <FormField
            label="End Date"
            name="endTime"
            type="date"
            value={formData.endTime}
            onChange={(value) => setFormData({ ...formData, endTime: value as string })}
            error={formErrors.endTime}
          />

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