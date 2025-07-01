import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../../services/api';
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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

interface UsersResponse {
  data: User[];
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'TEACHER' | 'ADMIN'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const roleOptions = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'TEACHER', label: 'Teacher' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers((response.data as UsersResponse).data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'STUDENT'
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (user: User) => {
    const result = await showDeleteConfirmDialog(`${user.firstName} ${user.lastName}`);
    
    if (result.isConfirmed) {
      try {
        await usersAPI.delete(user.id);
        showSuccessAlert(
          'User Deleted', 
          `${user.firstName} ${user.lastName} has been successfully deleted.`
        );
        fetchUsers();
      } catch (error) {
        handleApiError(error, 'Failed to delete user');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!editingUser && !formData.password.trim()) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      showFormErrorAlert(errors);
      setFormErrors(errors);
      return;
    }

    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role
        });
        showSuccessAlert(
          'User Updated', 
          `${formData.firstName} ${formData.lastName} has been successfully updated.`
        );
      } else {
        await usersAPI.create(formData);
        showSuccessAlert(
          'User Created', 
          `${formData.firstName} ${formData.lastName} has been successfully created.`
        );
      }
      setShowModal(false);
      fetchUsers();
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
        handleApiError(error, 'Failed to save user');
      }
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_: any, user: User) => (
        <div className="text-sm font-medium text-gray-900">
          {user.firstName} {user.lastName}
        </div>
      )
    },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (role: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          role === 'ADMIN' ? 'bg-red-100 text-red-800' :
          role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {role}
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
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add User
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Users"
        subtitle="Manage system users and their roles"
        searchable={true}
        filterable={true}
        pagination={true}
        itemsPerPage={10}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Add User'}
      >
        <Form onSubmit={handleSubmit}>
          <FormField
            label="First Name"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={(value) => setFormData({ ...formData, firstName: value as string })}
            error={formErrors.firstName}
            required
          />
          <FormField
            label="Last Name"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={(value) => setFormData({ ...formData, lastName: value as string })}
            error={formErrors.lastName}
            required
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value as string })}
            error={formErrors.email}
            required
          />
          {!editingUser && (
            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(value) => setFormData({ ...formData, password: value as string })}
              error={formErrors.password}
              required
            />
          )}
          <FormField
            label="Role"
            name="role"
            type="select"
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value as 'STUDENT' | 'TEACHER' | 'ADMIN' })}
            options={roleOptions}
            error={formErrors.role}
            required
          />
          <FormActions
            onCancel={() => setShowModal(false)}
            submitText={editingUser ? 'Update User' : 'Create User'}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage; 