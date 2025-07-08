import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Form, FormField, FormActions } from '../components/Form';
import { Navigation, Footer } from '../components';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for success message from registration
    if (location.state?.message) {
      showSuccessAlert('Registration Successful!', location.state.message);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('LoginPage: Attempting login with email:', email);
      await login(email, password);
      console.log('LoginPage: Login successful, navigating to home page');
      
      // Navigate immediately without showing alert first
      navigate('/');
      
      // Show success message after navigation
      setTimeout(() => {
        try {
          showSuccessAlert('Login Successful!', 'Welcome back to EduLMS');
        } catch (alertError) {
          console.error('LoginPage: Error showing success alert:', alertError);
        }
      }, 500);
    } catch (error: any) {
      console.error('LoginPage: Login error:', error);
      console.error('LoginPage: Error message:', error.message);
      console.error('LoginPage: Error response:', error.response);
      
      // Handle specific approval status errors
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || error.message;
        
        if (errorMessage.includes('pending admin approval')) {
          showErrorAlert(
            'Registration Pending', 
            'Your registration request is pending admin approval. Please wait for approval or contact support at contact@edulms.com for assistance.'
          );
        } else if (errorMessage.includes('rejected by admin')) {
          showErrorAlert(
            'Account Rejected', 
            'Your account has been rejected by admin. Please contact support at contact@edulms.com for more information.'
          );
        } else {
          showErrorAlert('Access Denied', errorMessage);
        }
      } else {
        showErrorAlert('Login Failed', error.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation currentPage="login" />

      {/* Main Content */}
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome to the E-Learning Management System
            </p>
            {/* <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="text-blue-600 mr-2">ℹ️</div>
                <div className="text-sm text-blue-800">
                  <strong>New users:</strong> After registration, your account requires admin approval before you can log in. You'll receive a notification once approved.
                </div>
              </div>
            </div> */}
          </div>

          <Form onSubmit={handleSubmit}>
            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(value: string | number) => setEmail(value as string)}
              required
              placeholder="Enter your email"
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(value: string | number) => setPassword(value as string)}
              required
              placeholder="Enter your password"
            />

            <FormActions
              submitText={loading ? 'Signing in...' : 'Sign in'}
              disabled={loading}
            />
          </Form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up here
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

export default LoginPage; 