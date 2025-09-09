import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { showConfirmDialog, showSuccessAlert } from '../utils/sweetAlert';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isActive?: boolean;
  createdAt?: string;
  profile?: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    profilePicture?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string; role: string }) => Promise<void>;
  logout: () => void;
  logoutWithConfirmation: () => Promise<void>;
  updateUser: (userData: User) => void;
  isAuthenticated: boolean;
  onLoginSuccess?: (userId: string) => void;
  setOnLoginSuccess: (callback: (userId: string) => void) => void;
  onRegisterSuccess?: (userId: string) => void;
  setOnRegisterSuccess: (callback: (userId: string) => void) => void;
}

interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onLoginSuccess, setOnLoginSuccess] = useState<((userId: string) => void) | undefined>(undefined);
  const [onRegisterSuccess, setOnRegisterSuccess] = useState<((userId: string) => void) | undefined>(undefined);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('AuthContext: Checking authentication on mount');
    console.log('AuthContext: Token exists:', !!token);
    console.log('AuthContext: Saved user exists:', !!savedUser);
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('AuthContext: Setting user from localStorage:', userData);
        setUser(userData);
        // Preserve cart for existing logged-in user
        localStorage.setItem('edulms_cart_preserve', 'true');
        // Don't call login success callback here - it will be called by the separate effect
      } catch (error) {
        console.error('AuthContext: Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('AuthContext: No saved authentication found');
    }
    setLoading(false);
  }, []); // Remove onLoginSuccess dependency to prevent re-runs

  // Add a check to prevent unnecessary re-renders
  useEffect(() => {
    console.log('AuthContext: Authentication state changed:', {
      isAuthenticated: !!user,
      userId: user?.id,
      userEmail: user?.email
    });
  }, [user]);

  // Set up login success callback when it changes
  useEffect(() => {
    if (onLoginSuccess && user && typeof onLoginSuccess === 'function') {
      console.log('AuthContext: Login success callback set, calling for existing user:', user.id);
      try {
        onLoginSuccess(user.id);
      } catch (error) {
        console.error('AuthContext: Error in login success callback:', error);
      }
    }
  }, [onLoginSuccess, user?.id]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response);
      
      // Handle different response structures
      let token: string;
      let userData: User;
      
      const responseData = response.data as any;
      
      if (responseData && responseData.data) {
        // If response has nested data structure
        token = responseData.data.token;
        userData = responseData.data.user;
      } else if (responseData && responseData.token) {
        // If response has direct token and user
        token = responseData.token;
        userData = responseData.user;
      } else {
        throw new Error('Invalid response structure from login API');
      }
      
      console.log('Extracted token:', token);
      console.log('Extracted user:', userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      // Preserve cart for logged-in user
      localStorage.setItem('edulms_cart_preserve', 'true');
      // Call login success callback if set
      if (onLoginSuccess && typeof onLoginSuccess === 'function') {
        try {
          console.log('AuthContext: Calling login success callback for user:', userData.id);
          onLoginSuccess(userData.id);
          console.log('AuthContext: Login success callback completed');
        } catch (callbackError) {
          console.error('AuthContext: Error in login success callback:', callbackError);
          // Don't throw the error - login was successful, just the callback failed
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string; role: string }) => {
    try {
      await authAPI.register(userData);
      // Registration successful - call register success callback if set
      if (onRegisterSuccess) {
        // Note: We don't have the user ID yet since registration doesn't return it
        // We'll need to handle this differently - maybe by storing a flag to merge cart on first login
        localStorage.setItem('edulms_merge_cart_on_login', 'true');
      }
    } catch (error: any) {
      // Pass through the original error so the RegisterPage can handle it properly
      throw error;
    }
  };

  const logout = () => {
    // Preserve cart for guest users
    localStorage.setItem('edulms_cart_preserve', 'true');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const logoutWithConfirmation = async () => {
    const result = await showConfirmDialog(
      'Logout',
      'Are you sure you want to logout?',
      'Yes, Logout',
      'Cancel'
    );

    if (result.isConfirmed) {
      logout();
      showSuccessAlert('Logged Out', 'You have been successfully logged out.');
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    logoutWithConfirmation,
    updateUser,
    isAuthenticated: !!user,
    onLoginSuccess,
    setOnLoginSuccess,
    onRegisterSuccess,
    setOnRegisterSuccess
  };

  // Debug authentication state
  console.log('AuthContext: Current state:', {
    user: user ? `${user.firstName} ${user.lastName} (${user.email})` : null,
    isAuthenticated: !!user,
    loading,
    hasToken: !!localStorage.getItem('token'),
    hasSavedUser: !!localStorage.getItem('user')
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 