import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, User } from '../../../../services/api';
import Modal from '../../../../components/Modal';
import { Form, FormField, FormActions } from '../../../../components/Form';
import { 
  showSuccessAlert, 
  showDeleteConfirmDialog, 
  showFormErrorAlert,
  handleApiError 
} from '../../../../utils/sweetAlert';
import { Link } from 'react-router-dom';
import { DataTable } from '../../../../components';

interface UsersResponse {
  data: User[];
}

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  console.log("editingUser",editingUser);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'TEACHER' | 'ADMIN',
    isActive: true,
    profile: {
      phone: '',
      address: '',
      city: '',
      state: '',
      profilePicture: ''
    }
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const roleOptions = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'TEACHER', label: 'Teacher' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    document.title = 'Users Management - Admin Dashboard | E-LMS';
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll('?includeProfile=true');
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
      role: 'STUDENT',
      isActive: true,
      profile: {
        phone: '',
        address: '',
        city: '',
        state: '',
        profilePicture: ''
      }
    });
    setSelectedFile(null);
    setPreviewUrl('');
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
      role: user.role,
      isActive: user.isActive,
      profile: {
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        state: user.profile?.state || '',
        profilePicture: user.profile?.profilePicture || ''
      }
    });
    setSelectedFile(null);
    setPreviewUrl(user.profile?.profilePicture || '');
    setFormErrors({});
    setShowModal(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleViewDetails = (user: User) => {
    navigate(`/admin/users/${user.id}`);
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
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('role', formData.role);
      submitData.append('isActive', formData.isActive ? 'true' : 'false');
      if (!editingUser) {
        submitData.append('password', formData.password);
      }

      // Add profile data
      const profileData = {
        phone: formData.profile.phone,
        address: formData.profile.address,
        city: formData.profile.city,
        state: formData.profile.state
      };
      submitData.append('profile', JSON.stringify(profileData));

      // Add profile picture if selected
      if (selectedFile) {
        submitData.append('profilePicture', selectedFile);
      }

      if (editingUser) {
        await usersAPI.update(editingUser.id, submitData);
        showSuccessAlert(
          'User Updated', 
          `${formData.firstName} ${formData.lastName} has been successfully updated.`
        );
      } else {
        await usersAPI.create(submitData);
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
        <Link to={`/admin/users/${user.id}`}>
          <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            {user.profile?.profilePicture ? (
              <img 
                src={`${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${user.profile.profilePicture}`} 
                alt={`${user.firstName} ${user.lastName}`}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`fallback absolute inset-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm ${
              user.profile?.profilePicture ? 'hidden' : ''
            }`}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            {user.profile?.phone && (
              <div className="text-xs text-gray-500">{user.profile.phone}</div>
            )}
          </div>
        </div>
        </Link>
      )
    },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'location',
      label: 'Location',
      sortable: false,
      render: (_: any, user: User) => {
        if (user.profile?.city || user.profile?.state) {
          return (
            <div className="text-sm text-gray-900">
              {user.profile.city && user.profile.state 
                ? `${user.profile.city}, ${user.profile.state}`
                : user.profile.city || user.profile.state
              }
            </div>
          );
        }
        return <span className="text-gray-400">Not specified</span>;
      }
    },
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
    },
    {
      key: 'approvalStatus',
      label: 'Approval Status',
      sortable: true,
      render: (status: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          status === 'APPROVED' ? 'bg-green-100 text-green-800' :
          status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      )
    },
    {
      key: 'approvedAt',
      label: 'Approved At',
      sortable: true,
      render: (date: string, user: User) => {
        if (user.approvalStatus === 'APPROVED' && user.approvedAt) {
          return new Date(user.approvedAt).toLocaleDateString();
        }
        return <span className="text-gray-400">-</span>;
      }
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
        onView={handleViewDetails}
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

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Active Status</span>
            </label>
            {formErrors.isActive && (
              <p className="mt-1 text-sm text-red-600">{formErrors.isActive}</p>
            )}
          </div>
          
          {/* Profile Section */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
            
            {/* Profile Picture Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex-shrink-0 items-center space-x-16">
                
                 <div className="flex-shrink-0 relative">
                   
                 {editingUser?.profile?.profilePicture ? (
              <img 
                src={`${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${editingUser.profile.profilePicture}`} 
                alt={`${editingUser.firstName} ${editingUser.lastName}`}
                className="w-14 h-14 absolute rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`fallback absolute inset-0 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm ${
              editingUser?.profile?.profilePicture ? 'hidden' : ''
            }`}>
              {editingUser?.firstName.charAt(0)}{editingUser?.lastName.charAt(0)}
            </div>
                  
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Phone"
                name="phone"
                type="text"
                value={formData.profile.phone}
                onChange={(value) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, phone: value as string }
                })}
                error={formErrors.phone}
              />
              <FormField
                label="Address"
                name="address"
                type="text"
                value={formData.profile.address}
                onChange={(value) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, address: value as string }
                })}
                error={formErrors.address}
              />
              <FormField
                label="City"
                name="city"
                type="text"
                value={formData.profile.city}
                onChange={(value) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, city: value as string }
                })}
                error={formErrors.city}
              />
              <FormField
                label="State"
                name="state"
                type="text"
                value={formData.profile.state}
                onChange={(value) => setFormData({ 
                  ...formData, 
                  profile: { ...formData.profile, state: value as string }
                })}
                error={formErrors.state}
              />
            </div>
          </div>
          
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