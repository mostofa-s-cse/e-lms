import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { usersAPI, User } from '../../../services/api';
import Modal from '../../../components/Modal';
import { Form, FormField, FormActions } from '../../../components/Form';
import { 
  handleApiError,
  showSuccessAlert,
  showFormErrorAlert
} from '../../../utils/sweetAlert';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  console.log("user",user);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getById(user!.id);
      if (response.data.data) {
        const userData = response.data.data;
        setFormData({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          profile: {
            phone: userData.profile?.phone || '',
            address: userData.profile?.address || '',
            city: userData.profile?.city || '',
            state: userData.profile?.state || '',
            profilePicture: userData.profile?.profilePicture || ''
          }
        });
        setPreviewUrl(userData.profile?.profilePicture || '');
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch profile details');
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
      submitData.append('role', user!.role);
      submitData.append('isActive', 'true');

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

      const response = await usersAPI.updateProfile(submitData);
      
      if (response.data.success) {
        // Update the user context with new data
        const updatedUser = response.data.data;
        if (updatedUser) {
          updateUser(updatedUser);
        }
        
        showSuccessAlert(
          'Profile Updated', 
          'Your profile has been successfully updated.'
        );
        setShowEditModal(false);
        fetchUserProfile(); // Refresh profile data
      }
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
        handleApiError(error, 'Failed to update profile');
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
        <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and settings</p>
        </div>
        <button
          onClick={handleEdit}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-8 text-white">
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
              <div className={`fallback absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center border-4 border-white ${
                user.profile?.profilePicture ? 'hidden' : ''
              }`}>
                <span className="text-2xl font-bold text-white">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-green-100 text-lg">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  user.isActive === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive === true ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
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
                    user.isActive === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive === true ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}</p>
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
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
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
                  {previewUrl ? (
                    <img 
                      src={previewUrl.startsWith('blob:') ? previewUrl : `${process.env.REACT_APP_IMG_URL || 'http://localhost:4000'}${previewUrl}`}
                      alt="Profile preview"
                      className="w-14 h-14 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
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
                    {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
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
            submitText="Update Profile"
          />
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage; 