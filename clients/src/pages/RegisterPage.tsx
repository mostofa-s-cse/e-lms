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
    } else {
      const passwordErrors = validatePassword(formData.password);
      
      if (passwordErrors.length > 0) {
        errors.password = 'Password requirements not met';
        // Show detailed error alert for password requirements
        showErrorAlert(
          'Password Requirements Not Met',
          `Your password must meet the following requirements:\n\n${passwordErrors.map(error => `• ${error}`).join('\n')}`
        );
      }
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
        'Your account has been created successfully and is pending admin approval. You will be notified once your account is approved and can then log in. Your cart items will be automatically transferred to your new account once you log in.'
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

  const validatePassword = (password: string) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push('At least 6 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Contains at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Contains at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Contains at least one number');
    }
    
    return errors;
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Show password requirements alert when user starts typing password
    if (field === 'password' && value && typeof value === 'string' && value.length > 0) {
      const passwordErrors = validatePassword(value);
      if (passwordErrors.length > 0) {
        // Don't show alert immediately, let user finish typing
        // We'll show it on form submission instead
      }
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

            <div className="relative">
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
              <button
                type="button"
                onClick={() => {
                  showErrorAlert(
                    'Password Requirements',
                    'Your password must meet the following requirements:\n\n• At least 6 characters long\n• Contains at least one lowercase letter\n• Contains at least one uppercase letter\n• Contains at least one number'
                  );
                }}
                className="absolute right-2 top-8 text-blue-600 hover:text-blue-800 text-sm"
                title="Show password requirements"
              >
                ℹ️
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="text-sm text-gray-600 mb-2 flex items-center justify-between">
                  <span>Password Strength:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const passwordErrors = validatePassword(formData.password);
                      const allRequirements = [
                        'At least 6 characters long',
                        'Contains at least one lowercase letter',
                        'Contains at least one uppercase letter',
                        'Contains at least one number'
                      ];
                      
                      if (passwordErrors.length === 0) {
                        showSuccessAlert(
                          'Password Requirements Met!',
                          'Your password meets all requirements:\n\n• At least 6 characters long\n• Contains at least one lowercase letter\n• Contains at least one uppercase letter\n• Contains at least one number'
                        );
                      } else {
                        showErrorAlert(
                          'Password Requirements',
                          `Your password must meet the following requirements:\n\n${passwordErrors.map(error => `• ${error}`).join('\n')}`
                        );
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                  >
                    📋 Show requirements
                  </button>
                </div>
                <div className="flex space-x-1">
                  {['length', 'lowercase', 'uppercase', 'number'].map((requirement) => {
                    const isValid = 
                      (requirement === 'length' && formData.password.length >= 6) ||
                      (requirement === 'lowercase' && /(?=.*[a-z])/.test(formData.password)) ||
                      (requirement === 'uppercase' && /(?=.*[A-Z])/.test(formData.password)) ||
                      (requirement === 'number' && /(?=.*\d)/.test(formData.password));
                    
                    return (
                      <div
                        key={requirement}
                        className={`flex-1 h-2 rounded ${
                          isValid ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={`${requirement.charAt(0).toUpperCase() + requirement.slice(1)} requirement ${isValid ? 'met' : 'not met'}`}
                      />
                    );
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {validatePassword(formData.password).length === 0 ? '✅ Strong password' : '⚠️ Please meet all requirements'}
                </div>
              </div>
            )}

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


        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RegisterPage; 