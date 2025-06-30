import React, { useState, useEffect } from 'react';
import { intakesAPI } from '../../../services/api';
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

interface Intake {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
}

interface IntakesResponse {
  data: Intake[];
}

const IntakesPage = () => {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIntake, setEditingIntake] = useState<Intake | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    maxStudents: 50,
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchIntakes();
  }, []);

  const fetchIntakes = async () => {
    try {
      setLoading(true);
      const response = await intakesAPI.getAll();
      setIntakes((response.data as IntakesResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch intakes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingIntake(null);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      maxStudents: 50,
      isActive: true
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (intake: Intake) => {
    setEditingIntake(intake);
    setFormData({
      name: intake.name,
      description: intake.description,
      startDate: intake.startDate.split('T')[0],
      endDate: intake.endDate.split('T')[0],
      maxStudents: intake.maxStudents,
      isActive: intake.isActive
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (intake: Intake) => {
    const result = await showDeleteConfirmDialog(`"${intake.name}"`);
    
    if (result.isConfirmed) {
      try {
        await intakesAPI.delete(intake.id);
        showSuccessAlert(
          'Intake Deleted', 
          `"${intake.name}" has been successfully deleted.`
        );
        fetchIntakes();
      } catch (error) {
        handleApiError(error, 'Failed to delete intake');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (formData.maxStudents < 1) errors.maxStudents = 'Maximum students must be at least 1';
    
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
          'Intake Updated', 
          `"${formData.name}" has been successfully updated.`
        );
      } else {
        await intakesAPI.create(formData);
        showSuccessAlert(
          'Intake Created', 
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
        handleApiError(error, 'Failed to save intake');
      }
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (name: string, intake: Intake) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{intake.description}</div>
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
      key: 'maxStudents',
      label: 'Max Students',
      render: (maxStudents: number) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {maxStudents} students
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
        <h1 className="text-3xl font-bold">Intakes Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Intake
        </button>
      </div>

      <DataTable
        columns={columns}
        data={intakes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingIntake ? 'Edit Intake' : 'Create Intake'}
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
            label="Maximum Students"
            name="maxStudents"
            type="number"
            value={formData.maxStudents}
            onChange={(value) => setFormData({ ...formData, maxStudents: value as number })}
            error={formErrors.maxStudents}
            required
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

export default IntakesPage; 