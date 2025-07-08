import React, { useState, useEffect } from 'react';
import { intakesAPI, coursesAPI } from '../../../services/api';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import SearchableDropdown from '../../../components/SearchableDropdown';
import { 
  showSuccessAlert, 
  showDeleteConfirmDialog, 
  showFormErrorAlert,
  handleApiError 
} from '../../../utils/sweetAlert';
import { DataTable } from '../../../components';

interface Course {
  id: string;
  title: string;
  code: string;
}

interface Batch {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  amount: number;
  isActive: boolean;
  createdAt: string;
  course: Course;
  _count?: {
    enrollments: number;
  };
}

interface IntakesResponse {
  data: Batch[];
}

interface CoursesResponse {
  data: Course[];
}

const BatchPage = () => {
  const [batches, setIntakes] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIntake, setEditingIntake] = useState<Batch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    courseId: '',
    amount: 0,
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchIntakes();
    fetchCourses();
  }, []);

  const fetchIntakes = async () => {
    try {
      setLoading(true);
      const response = await intakesAPI.getAll();
      setIntakes((response.data as IntakesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch batches');
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
    setEditingIntake(null);
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      courseId: '',
      amount: 0,
      isActive: true
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (batch: Batch) => {
    setEditingIntake(batch);
    setFormData({
      name: batch.name,
      startDate: batch.startDate.split('T')[0],
      endDate: batch.endDate.split('T')[0],
      courseId: batch.course.id,
      amount: batch.amount,
      isActive: batch.isActive
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (batch: Batch) => {
    const result = await showDeleteConfirmDialog(`"${batch.name}"`);
    
    if (result.isConfirmed) {
      try {
        await intakesAPI.delete(batch.id);
        showSuccessAlert(
          'Batch Deleted', 
          `"${batch.name}" has been successfully deleted.`
        );
        fetchIntakes();
      } catch (error) {
        handleApiError(error, 'Failed to delete batch');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (!formData.courseId) errors.courseId = 'Course is required';
    if (formData.amount < 0) errors.amount = 'Amount cannot be negative';
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.endDate = 'End date must be after start date';
    }

    if (Object.keys(errors).length > 0) {
      showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }

    try {
      if (editingIntake) {
        await intakesAPI.update(editingIntake.id, formData);
        showSuccessAlert(
          'Batch Updated', 
          `"${formData.name}" has been successfully updated.`
        );
      } else {
        await intakesAPI.create(formData);
        showSuccessAlert(
          'Batch Created', 
          `"${formData.name}" has been successfully created.`
        );
      }
      setShowModal(false);
      fetchIntakes();
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
        handleApiError(error, 'Failed to save batch');
      }
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (name: string, batch: Batch) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{batch.course.title} ({batch.course.code})</div>
        </div>
      )
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (date: string) => (
        <span className="text-sm text-gray-900">
          {new Date(date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (date: string) => (
        <span className="text-sm text-gray-900">
          {new Date(date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (amount: number) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          amount === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {amount === 0 ? 'Free' : `BDT ${amount.toFixed(2)}`}
        </span>
      )
    },
    {
      key: 'enrollments',
      label: 'Enrollments',
      render: (_: any, batch: Batch) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {batch._count?.enrollments || 0} students
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
        <h1 className="text-3xl font-bold">Batches Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Batch
        </button>
      </div>

      <DataTable
        columns={columns}
        title="Batches"
        subtitle="Manage academic batches and their details"
        data={batches}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingIntake ? 'Edit Batch' : 'Create Batch'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <FormField
            label="Name"
            name="name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value as string })}
            error={formErrors.name}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(value) => setFormData({ ...formData, startDate: value as string })}
              error={formErrors.startDate}
              required
            />

            <FormField
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={(value) => setFormData({ ...formData, endDate: value as string })}
              error={formErrors.endDate}
              required
            />
          </div>

          <FormField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={(value) => setFormData({ ...formData, amount: value as number })}
            error={formErrors.amount}
          />

          <SearchableDropdown
            label="Course"
            value={formData.courseId}
            onChange={(value) => setFormData({ ...formData, courseId: value })}
            options={courses.map(course => ({
              value: course.id,
              label: `${course.code} - ${course.title}`
            }))}
            placeholder="Select a course..."
            error={formErrors.courseId}
            required
            disabled={!!editingIntake} // Disable course selection when editing
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
            submitText={editingIntake ? 'Update' : 'Create'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default BatchPage; 