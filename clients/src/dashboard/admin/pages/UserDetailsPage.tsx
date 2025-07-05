import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI, User } from '../../../services/api';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import { 
  handleApiError,
  showSuccessAlert,
  showFormErrorAlert
} from '../../../utils/sweetAlert';

const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getById(id!);
      console.log("response",response);
      if (response.data.data) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'TEACHER': return 'bg-blue-100 text-blue-800';
      case 'STUDENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = () => {
    if (!user) return;
    
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
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
    setShowEditModal(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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

      await usersAPI.update(user!.id, submitData);
      showSuccessAlert(
        'User Updated', 
        `${formData.firstName} ${formData.lastName} has been successfully updated.`
      );
      setShowEditModal(false);
      fetchUser(); // Refresh user data
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
        handleApiError(error, 'Failed to update user');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
        <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600 mt-1">View detailed information about this user</p>
        </div>
        <button
          onClick={() => navigate('/admin/users')}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Back to Users
        </button>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              {user.profile?.profilePicture ? (
                <img 
                  src={`${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${user.profile.profilePicture}`} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`fallback absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white ${
                user.profile?.profilePicture ? 'hidden' : ''
              }`}>
                <span className="text-2xl font-bold text-white">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-blue-100 text-lg">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-gray-900">{user.profile?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{user.profile?.address || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="text-gray-900">{user.profile?.city || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">State</label>
                  <p className="text-gray-900">{user.profile?.state || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900">
                    {user.profile?.city && user.profile?.state 
                      ? `${user.profile.city}, ${user.profile.state}`
                      : user.profile?.city || user.profile?.state || 'Not specified'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit User
              </button>
              <button
                onClick={() => navigate('/admin/users')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to Users
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
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
                   
                 {user.profile?.profilePicture ? (
              <img 
                src={`${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${user.profile.profilePicture}`} 
                alt={`${user.firstName} ${user.lastName}`}
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
              user.profile?.profilePicture ? 'hidden' : ''
            }`}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
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
            onCancel={() => setShowEditModal(false)}
            submitText="Update User"
          />
        </Form>
      </Modal>
    </div>
  );
};

export default UserDetailsPage; 