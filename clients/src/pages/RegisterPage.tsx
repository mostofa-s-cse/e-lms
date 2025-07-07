import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Form, FormField, FormActions } from '../components/Form';
import { Navigation, Footer } from '../components';
import { showSuccessAlert, showErrorAlert, showFormErrorAlert } from '../utils/sweetAlert';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  general?: string;
  [key: string]: string | undefined;
}

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT'
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { register, setOnRegisterSuccess } = useAuth();
  const navigate = useNavigate();

  // Set up register success callback to handle cart merging
  useEffect(() => {
    setOnRegisterSuccess((userId: string) => {
      console.log('RegisterPage: Registration successful, cart will be merged on first login');
      // The cart merging will happen automatically when the user logs in for the first time
    });
  }, [setOnRegisterSuccess]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Please select a role';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const filteredErrors = Object.fromEntries(
        Object.entries(formErrors).filter(([_, value]) => value !== undefined)
      ) as Record<string, string>;
      showFormErrorAlert(filteredErrors);
      return;
    }

    setLoading(true);
    setFormErrors({});

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      
      // Registration successful - show success message and redirect
      showSuccessAlert(
        'Registration Successful!', 
        'Your account has been created successfully. Please log in with your new account. Your cart items will be automatically transferred to your new account.'
      );
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Registration failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle different error response formats
      if (error.response?.data?.message) {
        // Handle simple message format like "Email already exists"
        console.log('Showing error message:', error.response.data.message);
        showErrorAlert('Registration Failed', error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle field-specific errors from server
        console.log('Showing field-specific errors:', error.response.data.errors);
        const serverErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field) {
            serverErrors[err.field as keyof FormErrors] = err.message;
          }
        });
        const filteredServerErrors = Object.fromEntries(
          Object.entries(serverErrors).filter(([_, value]) => value !== undefined)
        ) as Record<string, string>;
        showFormErrorAlert(filteredServerErrors);
      } else if (error.message) {
        // Handle error.message if available
        console.log('Showing error.message:', error.message);
        showErrorAlert('Registration Failed', error.message);
      } else {
        console.log('Showing generic error message');
        showErrorAlert('Registration Failed', 'An error occurred during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation currentPage="register" />

      {/* Main Content */}
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join the E-Learning Management System
            </p>
          </div>

          <Form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="First Name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={(value) => handleInputChange('firstName', value as string)}
                error={formErrors.firstName}
                required
                placeholder="Enter your first name"
              />

              <FormField
                label="Last Name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={(value) => handleInputChange('lastName', value as string)}
                error={formErrors.lastName}
                required
                placeholder="Enter your last name"
              />
            </div>

            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value as string)}
              error={formErrors.email}
              required
              placeholder="Enter your email address"
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value as string)}
              error={formErrors.password}
              required
              placeholder="Create a strong password"
            />

            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value as string)}
              error={formErrors.confirmPassword}
              required
              placeholder="Confirm your password"
            />

            <FormField
              label="Role"
              name="role"
              type="select"
              value={formData.role}
              onChange={(value) => handleInputChange('role', value as string)}
              error={formErrors.role}
              required
              options={[
                { value: 'STUDENT', label: 'Student' },
                { value: 'TEACHER', label: 'Teacher' }
              ]}
            />

            <FormActions
              submitText={loading ? 'Creating account...' : 'Create account'}
              disabled={loading}
            />
          </Form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Password Requirements</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>• At least 6 characters long</p>
              <p>• Contains at least one uppercase letter</p>
              <p>• Contains at least one lowercase letter</p>
              <p>• Contains at least one number</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RegisterPage; 