import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../../services/api';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showDeleteConfirmDialog, 
  showFormErrorAlert,
  handleApiError 
} from '../../../utils/sweetAlert';

interface Course {
  id: string;
  title: string;
  description: string;
  code: string;
  credits: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
}

interface CoursesResponse {
  data: Course[];
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    credits: 3,
    duration: 12,
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAll();
      setCourses((response.data as CoursesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      code: '',
      credits: 3,
      duration: 12,
      isActive: true
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      code: course.code,
      credits: course.credits,
      duration: course.duration,
      isActive: course.isActive
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (course: Course) => {
    const result = await showDeleteConfirmDialog(`"${course.title}"`);
    
    if (result.isConfirmed) {
      try {
        await coursesAPI.delete(course.id);
        showSuccessAlert(
          'Course Deleted', 
          `"${course.title}" has been successfully deleted.`
        );
        fetchCourses();
      } catch (error) {
        handleApiError(error, 'Failed to delete course');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.code.trim()) errors.code = 'Course code is required';
    if (formData.credits < 1) errors.credits = 'Credits must be at least 1';
    if (formData.duration < 1) errors.duration = 'Duration must be at least 1';

    if (Object.keys(errors).length > 0) {
      showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }

    try {
      if (editingCourse) {
        await coursesAPI.update(editingCourse.id, formData);
        showSuccessAlert(
          'Course Updated', 
          `"${formData.title}" has been successfully updated.`
        );
      } else {
        await coursesAPI.create(formData);
        showSuccessAlert(
          'Course Created', 
          `"${formData.title}" has been successfully created.`
        );
      }
      setShowModal(false);
      fetchCourses();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Handle field-specific errors from server
        const serverErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) {
            serverErrors[err.field] = err.message;
          }
        });
        showFormErrorAlert(serverErrors);
        setFormErrors(serverErrors);
      } else {
        handleApiError(error, 'Failed to save course');
      }
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Course',
      render: (title: string, course: Course) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{course.code}</div>
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
      key: 'credits',
      label: 'Credits',
      render: (credits: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {credits} credits
        </span>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (duration: number) => (
        <span className="text-sm text-gray-900">{duration} weeks</span>
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
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-gray-600 mt-2">Manage your teaching courses</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Course
        </button>
      </div>

      <DataTable
        columns={columns}
        data={courses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCourse ? 'Edit Course' : 'Create Course'}
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
            label="Course Code"
            name="code"
            value={formData.code}
            onChange={(value) => setFormData({ ...formData, code: value as string })}
            error={formErrors.code}
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
              label="Credits"
              name="credits"
              type="number"
              value={formData.credits}
              onChange={(value) => setFormData({ ...formData, credits: value as number })}
              error={formErrors.credits}
              required
            />

            <FormField
              label="Duration (weeks)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={(value) => setFormData({ ...formData, duration: value as number })}
              error={formErrors.duration}
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
            submitText={editingCourse ? 'Update' : 'Create'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default CoursesPage; 