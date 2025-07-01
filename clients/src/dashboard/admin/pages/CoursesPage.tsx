import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../../services/api';
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

interface Course {
  id: string;
  title: string;
  description: string;
  code: string;
  credits: number;
  isActive: boolean;
  createdAt: string;
}

interface CoursesResponse {
  data: Course[];
}

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    credits: 3
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
      credits: 3
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
      credits: course.credits
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (course: Course) => {
    const result = await showDeleteConfirmDialog(course.title);
    
    if (result.isConfirmed) {
      try {
        await coursesAPI.delete(course.id);
        showSuccessAlert(
          'Course Deleted', 
          `${course.title} has been successfully deleted.`
        );
        fetchCourses();
      } catch (error) {
        handleApiError(error, 'Failed to delete course');
      }
    }
  };

  const handleView = (course: Course) => {
    navigate(`/admin/courses/${course.id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.code.trim()) errors.code = 'Course code is required';
    if (formData.credits <= 0) errors.credits = 'Credits must be greater than 0';

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
          `${formData.title} has been successfully updated.`
        );
      } else {
        await coursesAPI.create(formData);
        showSuccessAlert(
          'Course Created', 
          `${formData.title} has been successfully created.`
        );
      }
      setShowModal(false);
      fetchCourses();
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
        handleApiError(error, 'Failed to save course');
      }
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (title: string) => (
        <div className="text-sm font-medium text-gray-900">{title}</div>
      )
    },
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (code: string) => (
        <div className="text-sm text-gray-900 font-mono">{code}</div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (description: string) => (
        <div className="text-sm text-gray-600 truncate max-w-xs">
          {description}
        </div>
      )
    },
    {
      key: 'credits',
      label: 'Credits',
      sortable: true,
      render: (credits: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {credits} credits
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
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
      sortable: true,
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Courses Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Course
        </button>
      </div>

      <DataTable
        columns={columns}
        data={courses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        title="Courses"
        subtitle="Manage academic courses and their details"
        searchable={true}
        filterable={true}
        pagination={true}
        itemsPerPage={10}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCourse ? 'Edit Course' : 'Add Course'}
      >
        <Form onSubmit={handleSubmit}>
          <FormField
            label="Title"
            name="title"
            type="text"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value as string })}
            error={formErrors.title}
            required
          />
          <FormField
            label="Course Code"
            name="code"
            type="text"
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
          />
          <FormField
            label="Credits"
            name="credits"
            type="number"
            value={formData.credits}
            onChange={(value) => setFormData({ ...formData, credits: value as number })}
            error={formErrors.credits}
            required
          />
          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingCourse ? 'Update Course' : 'Create Course'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default CoursesPage; 